import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { LikeGroup } from "../libs/enums/like.enum";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Like, LikeInput, LikeToggleResult } from "../libs/types/like";
import { Product } from "../libs/types/product";
import LikeModel from "../schema/Like.model";
import ProductModel from "../schema/Product.model";

/**
 * Member <-> product likes.
 *
 * Mirrors ViewService: a row per (member, target) pair, plus a denormalised
 * counter on the product so listings do not have to aggregate on every read.
 */
class LikeService {
  private readonly likeModel;
  private readonly productModel;

  constructor() {
    this.likeModel = LikeModel;
    this.productModel = ProductModel;
  }

  public async checkLikeExistence(input: LikeInput): Promise<Like> {
    return await this.likeModel
      .findOne({ memberId: input.memberId, likeRefId: input.likeRefId })
      .exec();
  }

  /** Like if not liked, unlike if already liked. */
  public async toggleLike(
    memberId: ObjectId,
    productId: string,
  ): Promise<LikeToggleResult> {
    const likeRefId = shapeIntoMongooseObjectId(productId);

    const product = await this.productModel.findById(likeRefId).exec();
    if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);

    const input: LikeInput = {
      memberId,
      likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };

    const exist = await this.checkLikeExistence(input);
    let liked: boolean;

    if (exist) {
      await this.likeModel.deleteOne({ _id: exist._id }).exec();
      liked = false;
    } else {
      try {
        await this.likeModel.create(input);
        liked = true;
      } catch (err: any) {
        // 11000 = the unique index rejected a duplicate, i.e. a parallel
        // request already inserted this exact like. Treat it as "already
        // liked" rather than an error, and do not touch the counter.
        if (err?.code === 11000) {
          const count = await this.countLikes(likeRefId);
          return { liked: true, likesCount: count };
        }
        console.log("ERROR, model:toggleLike:", err);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }
    }

    const updated = await this.productModel
      .findByIdAndUpdate(
        likeRefId,
        { $inc: { productLikes: liked ? 1 : -1 } },
        { new: true },
      )
      .exec();

    // A counter can only drift downwards through deleted rows or old data;
    // clamp so the UI never shows a negative number.
    const likesCount = Math.max(0, updated?.productLikes ?? 0);
    return { liked, likesCount };
  }

  private async countLikes(likeRefId: ObjectId): Promise<number> {
    return await this.likeModel.countDocuments({ likeRefId }).exec();
  }

  /** The products this member has liked, newest like first. */
  public async getMemberLikes(memberId: ObjectId): Promise<Product[]> {
    const likes = await this.likeModel
      .find({ memberId, likeGroup: LikeGroup.PRODUCT })
      .sort({ createdAt: -1 })
      .exec();

    if (!likes.length) return [];

    const ids = likes.map((like: Like) => like.likeRefId);
    const products = await this.productModel
      .find({ _id: { $in: ids }, productStatus: ProductStatus.PROCESS })
      .exec();

    // Keep the like order — $in returns documents in arbitrary order.
    const byId = new Map(products.map((p: T) => [String(p._id), p]));
    return ids
      .map((id: ObjectId) => byId.get(String(id)))
      .filter(Boolean) as Product[];
  }

  /**
   * One-off migration of likes a visitor accumulated before signing in.
   * Duplicates are skipped, so running it twice is harmless.
   */
  public async syncLikes(
    memberId: ObjectId,
    productIds: string[],
  ): Promise<Product[]> {
    for (const rawId of productIds) {
      try {
        const likeRefId = shapeIntoMongooseObjectId(rawId);
        const exist = await this.checkLikeExistence({
          memberId,
          likeRefId,
          likeGroup: LikeGroup.PRODUCT,
        });
        if (exist) continue;

        await this.likeModel.create({
          memberId,
          likeRefId,
          likeGroup: LikeGroup.PRODUCT,
        });
        await this.productModel
          .findByIdAndUpdate(likeRefId, { $inc: { productLikes: 1 } })
          .exec();
      } catch (err) {
        // A bad id or a duplicate must not abort the rest of the migration.
        console.log("syncLikes skipped one id:", rawId, err);
      }
    }

    return await this.getMemberLikes(memberId);
  }
}

export default LikeService;

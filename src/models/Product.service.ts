import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";

import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductServise {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }
  /** spa */
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };
    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }
    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);

    if (memberId) {
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistence(input);
      console.log("existView:", !!existView);
      // Count a view only the first time this member opens the product.
      if (!existView) {
        //Insert view
        await this.viewService.insertMemberView(input);

        //increase Counts (only on the first view per member)
        await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true },
          )
          .exec();
      }
    }

    return result;
  }
  /** ssr */

  public async getAllProducts(
    page: number = 1,
    limit: number = 8,
  ): Promise<{
    list: Product[];
    total: number;
    activeCount: number;
    pausedCount: number;
    imageCount: number;
  }> {
    const visible = { productStatus: { $ne: ProductStatus.DELETE } };
    const [list, total, activeCount, pausedCount, imageAgg] = await Promise.all([
      this.productModel
        .find(visible)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(visible).exec(),
      this.productModel
        .countDocuments({ productStatus: ProductStatus.PROCESS })
        .exec(),
      this.productModel
        .countDocuments({ productStatus: ProductStatus.PAUSE })
        .exec(),
      this.productModel
        .aggregate([
          { $match: visible },
          { $project: { n: { $size: { $ifNull: ["$productImages", []] } } } },
          { $group: { _id: null, total: { $sum: "$n" } } },
        ])
        .exec(),
    ]);
    if (!list) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);

    const imageCount = imageAgg[0]?.total ?? 0;
    return { list, total, activeCount, pausedCount, imageCount };
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async updateChosenProduct(
    //parametr
    id: string,
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductServise;

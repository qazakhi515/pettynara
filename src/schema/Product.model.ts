import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductStatus,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
      required: true,
    },

    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
    // Denormalised count of Like rows, kept in step by LikeService.toggleLike
    // so listings never have to aggregate the likes collection.
    productLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }, // updateAd, createAd
);

productSchema.index({ productName: 1 }, { unique: true });
export default mongoose.model("Product", productSchema);

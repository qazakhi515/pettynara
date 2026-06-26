import mongoose, { Schema } from "mongoose";
import { HelperAnimal, HelperStatus } from "../libs/enums/petHelper.enum";

const petHelperSchema = new Schema(
  {
    helperStatus: {
      type: String,
      enum: HelperStatus,
      default: HelperStatus.ACTIVE,
    },

    helperNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    helperPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    helperPassword: {
      type: String,
      select: false,
      required: true,
    },

    helperImage: {
      type: String,
    },

    helperLocation: {
      type: String,
    },

    helperAnimals: {
      type: [String],
      enum: HelperAnimal,
      default: [],
    },

    helperExperience: {
      type: Number,
      default: 0,
    },

    helperDesc: {
      type: String,
    },

    helperLikes: {
      type: Number,
      default: 0,
    },

    helperViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PetHelper", petHelperSchema);

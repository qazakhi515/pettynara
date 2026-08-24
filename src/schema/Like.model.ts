import mongoose, { Schema } from "mongoose";
import { LikeGroup } from "../libs/enums/like.enum";

const likeSchema = new Schema(
  {
    likeGroup: {
      type: String,
      enum: LikeGroup,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

/**
 * A member can like a given target exactly once. Without this, two clicks
 * landing at the same moment both pass the "does it exist?" check and insert,
 * which leaves the productLikes counter permanently ahead of reality.
 */
likeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);

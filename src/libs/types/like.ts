import { ObjectId } from "mongoose";
import { LikeGroup } from "../enums/like.enum";

export interface Like {
  _id: ObjectId;
  likeGroup: LikeGroup;
  memberId: ObjectId;
  likeRefId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LikeInput {
  memberId: ObjectId;
  likeRefId: ObjectId;
  likeGroup: LikeGroup;
}

/** What a toggle reports back, so the client can settle its optimistic state. */
export interface LikeToggleResult {
  liked: boolean;
  likesCount: number;
}

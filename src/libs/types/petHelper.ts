import { ObjectId } from "mongoose";
import { HelperAnimal, HelperStatus } from "../enums/petHelper.enum";

export interface PetHelper {
  _id: ObjectId;
  helperStatus: HelperStatus;
  helperNick: string;
  helperPhone: string;
  helperPassword?: string;
  helperImage?: string;
  helperLocation?: string;
  helperAnimals: HelperAnimal[];
  helperExperience: number;
  helperDesc?: string;
  helperLikes: number;
  helperViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetHelperInput {
  helperStatus?: HelperStatus;
  helperNick: string;
  helperPhone: string;
  helperPassword: string;
  helperImage?: string;
  helperLocation?: string;
  helperAnimals?: HelperAnimal[];
  helperExperience?: number;
  helperDesc?: string;
  helperLikes?: number;
  helperViews?: number;
}

export interface PetHelperUpdateInput {
  _id: ObjectId;
  helperStatus?: HelperStatus;
  helperNick?: string;
  helperPhone?: string;
  helperPassword?: string;
  helperImage?: string;
  helperLocation?: string;
  helperAnimals?: HelperAnimal[];
  helperExperience?: number;
  helperDesc?: string;
  helperLikes?: number;
  helperViews?: number;
}

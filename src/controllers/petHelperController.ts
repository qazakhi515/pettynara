import { Request, Response } from "express";
import { T } from "../libs/types/common";
import PetHelperService from "../models/PetHelper.service";
import Errors from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import {
  PetHelperInput,
  PetHelperUpdateInput,
} from "../libs/types/petHelper";

const petHelperService = new PetHelperService();
const petHelperController: T = {};

petHelperController.createPetHelper = async (req: Request, res: Response) => {
  try {
    console.log("createPetHelper");
    const input: PetHelperInput = req.body;
    const result = await petHelperService.createPetHelper(input);
    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, createPetHelper:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

petHelperController.getPetHelpers = async (req: Request, res: Response) => {
  try {
    console.log("getPetHelpers");
    const result = await petHelperService.getPetHelpers();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getPetHelpers:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

petHelperController.getPetHelper = async (req: Request, res: Response) => {
  try {
    console.log("getPetHelper");
    const { id } = req.params;
    const result = await petHelperService.getPetHelper(id as string);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getPetHelper:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

petHelperController.updateChosenPetHelper = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateChosenPetHelper");
    const input: PetHelperUpdateInput = req.body;
    const result = await petHelperService.updateChosenPetHelper(input);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateChosenPetHelper:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default petHelperController;

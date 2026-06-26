import PetHelperModel from "../schema/PetHelper.model";
import {
  PetHelper,
  PetHelperInput,
  PetHelperUpdateInput,
} from "../libs/types/petHelper";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { HelperStatus } from "../libs/enums/petHelper.enum";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";

class PetHelperService {
  private readonly petHelperModel;

  constructor() {
    this.petHelperModel = PetHelperModel;
  }

  public async createPetHelper(input: PetHelperInput): Promise<PetHelper> {
    const salt = await bcrypt.genSalt();
    input.helperPassword = await bcrypt.hash(input.helperPassword, salt);

    try {
      const result = await this.petHelperModel.create(input);
      result.helperPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("Error, model:createPetHelper", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getPetHelpers(): Promise<PetHelper[]> {
    const result = await this.petHelperModel
      .find({ helperStatus: HelperStatus.ACTIVE })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);
    return result;
  }

  public async getPetHelper(id: string): Promise<PetHelper> {
    const helperId = shapeIntoMongooseObjectId(id);
    const result = await this.petHelperModel
      .findOne({ _id: helperId, helperStatus: HelperStatus.ACTIVE })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);
    return result;
  }

  public async updateChosenPetHelper(
    input: PetHelperUpdateInput
  ): Promise<PetHelper> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.petHelperModel
      .findByIdAndUpdate({ _id: input._id }, input, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default PetHelperService;

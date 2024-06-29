import { option, ParcelValidation } from "./validation";
import { Parcel, ParcelRepository, ParcelModel } from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { v4 as uuid } from "uuid";
import { Utils } from "../../utils";
import { Op } from "sequelize";

export class ParcelService {
  private repository: ParcelRepository;
  constructor() {
    this.repository = new ParcelRepository();
  }
  async create(input: Parcel) {
    const { error, value } = ParcelValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.name = Utils.Capitalizeword(value.name);
    const parcel = await this.repository.find({ name: value.name });
    if (parcel) {
      throw new BadRequestError("Parcel already exist", "");
    }

    value.id = uuid();

    return await new ParcelRepository().create(value);
  }
  async getAllParcel() {
    return await this.repository.findMany();
  }
  async searchParcel(input: string) {
    return await ParcelModel.findAll({
      where: {
        name: {
          [Op.iLike]: `%${input}%`,
        },
      },
    });
  }
  async getParcel(id: string) {
    const parcel = await this.repository.find({ id });
    if (!parcel) {
      throw new BadRequestError("parcel not found", "");
    }
    return parcel;
  }
}

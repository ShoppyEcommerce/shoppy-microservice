import {
  DeliveryProfileValidation,
  UpdateDeliveryProfileValidation,
  option,
} from "./validation";
import { DeliveryProfile, DeliveryProfileRepository } from "../../database";
import { v4 as uuid } from "uuid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";

export class DeliveryProfileService {
  private repository: DeliveryProfileRepository;

  constructor() {
    this.repository = new DeliveryProfileRepository();
  }

  async create(input: DeliveryProfile, deliveryManId: string) {
    const { error, value } = DeliveryProfileValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const profile = await this.repository.Find({ deliveryManId });
    if (profile) {
      throw new BadRequestError("you already have a profile", "");
    }
    value.id = uuid();
    const delivery = await this.repository.create(value);
    return Utils.FormatData(delivery);
  }
  async getDeliveryProfile(deliveryManId: string) {
    const profile = (await this.repository.Find({
      deliveryManId,
    })) as unknown as DeliveryProfile;
    if (!profile) {
      throw new BadRequestError("profile not found", "");
    }
    return Utils.FormatData(profile);
  }
  async update(input: Partial<DeliveryProfile>, id: string) {
    const { error } = UpdateDeliveryProfileValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const update = await this.repository.update(id, input);
    return Utils.FormatData(update);
  }
}

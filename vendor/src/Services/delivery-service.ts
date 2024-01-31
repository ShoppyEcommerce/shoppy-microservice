import { DeliveryRepository } from "../database/Repository/delivery-repository";
import { Delivery } from "../database/model/Delivery";
import { v4 as uuid } from "uuid";
import { loginVendorSchema, option, registerVendorSchema } from "./validation";
import { BadRequestError, ValidationError } from "../utils/app-error";
import { Utils } from "../utils";
import { Response } from "express";

export class DeliveryService {
  private repository: DeliveryRepository;
  constructor() {
    this.repository = new DeliveryRepository();
  }

  async createDelivery(input: Delivery) {
    const { error, value } = registerVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.repository.Find({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.repository.Find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }

    value.id = uuid();
    const vendor = await this.repository.create(value);
    return Utils.FormatData(vendor) as unknown as Delivery;
  }
  async Login(input: { phone: string }) {
    const { error, value } = loginVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = (await this.repository.Find({
      phone,
    })) as unknown as Delivery;
    if (!exist) {
      throw new BadRequestError("phone number does not exists", "Bad request");
    }
    const token = await Utils.Encoded({ id: exist.id });

    //send a verification code to the user phone number

    return Utils.FormatData(token);
  }
}

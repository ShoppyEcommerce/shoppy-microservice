import {
  Delivery,
  DeliveryAddress,
  DeliveryAddressRepository,
} from "../../database";
import { v4 as uuid } from "uuid";
import { BadRequestError } from "../../utils/ErrorHandler";
import { validateAddress } from "./validate";
import { option } from "../category/validation";

export class DeliveryAddressService {
  private repository = new DeliveryAddressRepository();

  async createAddress(input: Delivery, userId: string) {
    const { error, value } = validateAddress.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    value.id = uuid();
    value.userId = userId;
    return await this.repository.createDeliveryAddress(value);
  }

  async getAddress(id: string, userId: string) {
    const address = await this.repository.getDeliveryAddress({ id, userId });
    if (!address) {
      throw new BadRequestError("address not found", "");
    }
    return address;
  }
  async getAllDeliveryAddress(userId: string) {
    return await this.repository.getAllDeliveryAddress({ userId });
  }
  async updateDeliveryAddress(input: any, userId: string, id: string) {
    await this.getAddress(id, userId);

    const address = await this.repository.updateDelivery(input, id);
    return address[1][0];
  }
  async deleteDeliveryAddress(id: string, userId: string) {
    await this.getAddress(id, userId);

    await this.repository.deleteDelivery(id);
  }
}

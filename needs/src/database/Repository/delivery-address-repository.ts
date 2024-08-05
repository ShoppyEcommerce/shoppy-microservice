import { DeliveryAddress, Delivery, UserModel } from "../model";

export class DeliveryAddressRepository {
  async createDeliveryAddress(input: Delivery) {
    return await DeliveryAddress.create(input);
  }

  async getDeliveryAddress(input: Partial<Delivery>) {
    return await DeliveryAddress.findOne({
      where: input,
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
      ],
    });
  }
  async getAllDeliveryAddress(input: Partial<Delivery>) {
    return await DeliveryAddress.findAll({ where: input });
  }
  async updateDelivery(input: Partial<Delivery>, id: string) {
    return await DeliveryAddress.update(input, {
      where: { id },
      returning: true,
    });
  }
  async deleteDelivery(id: string) {
    await DeliveryAddress.destroy({ where: { id } });
  }
}

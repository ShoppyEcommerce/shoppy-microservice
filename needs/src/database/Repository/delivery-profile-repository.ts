import { DeliveryModel, DeliveryProfile, DeliveryProfileModel } from "../model";

export class DeliveryProfileRepository {
  async create(input: DeliveryProfile) {
    return await DeliveryProfileModel.create(input);
  }
  async Find(input: Partial<DeliveryProfile>) {
    return await DeliveryProfileModel.findOne({
      where: input,
      include: DeliveryModel,
    });
  }
  async FindAll() {
    return await DeliveryProfileModel.findAll({
      include: [
        {
          model: DeliveryModel,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });
  }
  async update(id: string, input: Partial<DeliveryProfile>) {
    return await DeliveryProfileModel.update(input, {
      where: input,
      returning: true,
    });
  }
}

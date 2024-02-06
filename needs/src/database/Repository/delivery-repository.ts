import { Delivery, DeliveryModel } from "../model/Delivery";

export class DeliveryRepository {
  async create(input: Delivery) {
    return DeliveryModel.create(input);
  }
  async Find(input: Record<string, string>) {
    return DeliveryModel.findOne({ where: input });
  }
}

import { Delivery, DeliveryModel } from "../model/delivery";

export class DeliveryRepository {
  async create(input: Delivery): Promise<Delivery> {
    return DeliveryModel.create(input) as unknown as Delivery;
  }
  async Find(input: Record<string, string>) {
    return DeliveryModel.findOne({ where: input });
  }
  async update(input: Partial<Delivery>, id: string) {
    await DeliveryModel.update(input, { where: { id } });
  }
}

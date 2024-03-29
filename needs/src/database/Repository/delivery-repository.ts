import { Delivery, DeliveryModel } from "../model/Delivery";

export class DeliveryRepository {
  async create(input: Delivery): Promise<Delivery> {
    return DeliveryModel.create(input) as unknown as Delivery;
  }
  async Find(input: Record<string, string>) {
    return DeliveryModel.findOne({ where: input });
  }
  async update(update: Partial<Delivery>, input: any) {
  return  await DeliveryModel.update(update, { where: input, returning: true, });
  }
  async findAll(input: Partial<Delivery>) {
    return await DeliveryModel.findAll({
      where: input,
    }) as unknown as Delivery[] | []
  }
}

import {  ShopPaymentModel, ShopPayment } from "../model";

export class ShopPaymentRepository {
  async create(input: ShopPayment) {
    return ShopPaymentModel.create(input);
  }
  async find(input: Partial<ShopPayment>) {
    return await ShopPaymentModel.findOne({
      where: input,
    });
  }
  async findAll(input: any) {
    return await ShopPaymentModel.findAll({
      where: input,
    });
  }
  async update(input: Partial<ShopPayment>, update: any) {
    await ShopPaymentModel.update(update, { where: input });
  }
}

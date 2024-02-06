import { Order, OrderModel } from "../model";

export class OrderRepository {
  async create(input: Order) {
    return OrderModel.create(input);
  }
  async Find(input: Record<string, string>) {
    return OrderModel.findOne({ where: input });
  }
}

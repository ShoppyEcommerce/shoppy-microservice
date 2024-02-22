import { CartModel, Order, OrderModel, UserModel } from "../model";

export class OrderRepository {
  async create(input: Order) {
    return OrderModel.create(input);
  }
  async Find(input: Partial<Order>) {
    return OrderModel.findOne({
      where: input,
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
      ],
    });
  }
  async FindAll(input: Partial<Order>) {
    return OrderModel.findAll({
      where: input,
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
      ],
    });
  }
  async updateOrder(input: Partial<Order>, id: string) {
    return OrderModel.update(input, {
      where: {
        id,
      },
    });
  }
}

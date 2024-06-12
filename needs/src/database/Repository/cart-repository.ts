import { CartModel, Cart, ShopModel, ProductModel } from "../model";

export class CartRepository {
  async createCart(input: Cart) {
    const cart = await CartModel.create(input);
    return cart;
  }
  async getOpenCart(input: Partial<Cart>) {
    return await CartModel.findOne({ where: input });
  }

  async getShopCart(input: Partial<Cart>) {
    return await CartModel.findAll({
      where: input,
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email", "shopDetails"],
        },
      ],
    });
  }
  async getAllCart(input: Partial<Cart>) {
    return (await CartModel.findAll({
      where: input,
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email", "shopDetails"],
        },
      ],
    })) as unknown as Cart[];
  }
  async updateCart(update: any, input: Partial<Cart>) {
    return await CartModel.update(update, {
      where: { id: input.id, ownerId: input.ownerId },
      returning: true,
    });
  }
  async deleteCart(input: Partial<Cart>) {
    await CartModel.destroy({
      where: { id: input.id, ownerId: input.ownerId },
    });
    return "cart deleted";
  }
  async deleteAllCart(input: Partial<Cart>) {}
}

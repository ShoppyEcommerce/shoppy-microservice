import { CartModel, Cart } from "../model";

export class CartRepository {
  async createCart(input: Cart) {
    const cart = await CartModel.create(input);
    return cart;
  }
  async getOpenCart(input: Partial<Cart>) {
    return await CartModel.findOne({ where: input });
  }
  async getAllCart(input: Partial<Cart>) {
     await CartModel.findAll({ where: input });
  
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
}

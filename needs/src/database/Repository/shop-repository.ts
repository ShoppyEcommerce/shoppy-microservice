import { Op } from "sequelize";
import { Shop, ShopModel } from "../model";

export class ShopRepository {
  async createShop(input: Shop) {
    const shop = await ShopModel.create(input);

    return shop;
  }

  async update(input: Partial<Shop>, id: string) {
    return await ShopModel.update(input, { where: { id }, returning: true });
  }
  async find(input: Partial<Shop>) {
    return (await ShopModel.findOne({
      where: input,
    })) as unknown as Shop;
  }
  async getShop(id: string) {
    return await ShopModel.findByPk(id);
  }
  async getAllShop() {
    return await ShopModel.findAll();
  }
  async getUnverifiedShop() {
    return await ShopModel.findAll({
      where: {
        isVerified: false,
      },
    });
  }
  async getVerifiedShop() {
    return await ShopModel.findAll({
      where: {
        isVerified: true,
      },
    });
  }
  async getTopSeller() {
    return await ShopModel.findAll({
      where:{
        numOfProductSold:{
          [Op.gt]:0
        }
      },
      order: [["numOfProductSold", "DESC"]],
    });
  }
}

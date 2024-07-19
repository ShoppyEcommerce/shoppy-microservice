import { FavoriteProduct, FavoriteProductModel, ProductModel, UserModel } from "../model";

export class FavoriteProductRepository {
  async create(input: FavoriteProduct) {
    const favorite = await FavoriteProductModel.create(input);
    return favorite;
  }
  async getFavorite(input: Partial<FavoriteProduct>) {
    const favorite = await FavoriteProductModel.findOne({
      where: input,
      include: [ProductModel],
    });
    return favorite;
  }

  async getFavorites(input: { userId: string }) {
    return FavoriteProductModel.findAll({ where: input, include: [
        {
            model:ProductModel
        },
        {
            model:UserModel,
            attributes:["id","firstName", "lastName"]
        }
    ] });
  }
  async delete(input: { userId: string; productId: string }) {
 
    await FavoriteProductModel.destroy({ where: input });
    return "favorite deleted";
  }
}

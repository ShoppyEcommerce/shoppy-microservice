import {FavoriteStore, FavoriteStoreModel, ShopModel} from ".."
export class FavoriteStoreRepository {
  async create(input: FavoriteStore) {
    const favorite = await FavoriteStoreModel.create(input);
    return favorite;
  }
  async getFavorite(input: Partial<FavoriteStore>) {
    const favorite = await FavoriteStoreModel.findOne({
      where: input,
      include: [{
        model:ShopModel,
        attributes: ["id", "phoneNumber", "shopDetails", "email"],

      },
 
    ],
    });
    return favorite;
  }

  async getFavorites(input: { userId: string }) {
    return FavoriteStoreModel.findAll({ where: input, include: [{
        model:ShopModel,
        attributes: ["id", "phoneNumber", "shopDetails", "email"],

      },] });
  }
  async delete(input: { userId: string; id: string }) {
    await FavoriteStoreModel.destroy({ where: input });
    return "favorite store deleted";
  }
}




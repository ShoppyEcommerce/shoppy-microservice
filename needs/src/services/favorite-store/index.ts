import {
  FavoriteStore,
  FavoriteStoreRepository,
  Shop,
  ShopRepository,
} from "../../database";
import { BadRequestError } from "../../utils/ErrorHandler";
import { FavoriteStoreValidation, option } from "./validation";
import { v4 as uuid } from "uuid";

export class FavoriteStoreService {
  repository: FavoriteStoreRepository;
  shopRepo: ShopRepository;

  constructor() {
    this.repository = new FavoriteStoreRepository();
    this.shopRepo = new ShopRepository();
  }

  async create(input: FavoriteStore, userId: string) {
    const { error } = FavoriteStoreValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const store = await this.shopRepo.getShop(input.shopId);
    if (!store) {
      throw new BadRequestError("store not found", "");
    }
    const favoriteStore = await this.repository.getFavorite({
      shopId: input.shopId,
      userId,
    });
    if (favoriteStore) {
      throw new BadRequestError(
        "This store is already in your favorite store list",
        ""
      );
    }
    input.id = uuid();
    await this.repository.create({
      id:input.id,
      shopId:input.shopId,
      userId,
      UserModelId:userId,
      ShopModelId:input.shopId,
    });
    const favorite = [...(store.dataValues?.favorite ?? ""), userId];
    await this.shopRepo.update({ favorite: [...favorite] }, input.shopId);
  }
  async getFavorite(shopId: string, userId: string) {
    const favoriteStore = (await this.repository.getFavorite({
      userId,
      shopId,
    })) as unknown as FavoriteStore;
    if (!favoriteStore) {
      throw new BadRequestError(
        "This store is not in your favorite store list",
        ""
      );
    }
    return favoriteStore;
  }

  async getFavorites(userId: string) {
    return await this.repository.getFavorites({ userId });
  }

  async deleteFavorite(userId: string, shopId: string) {
    const store = await this.repository.getFavorite({ shopId, userId });
    if (!store) {
      throw new BadRequestError(
        "This store is not in your favorite store list",
        ""
      );
    }
    const shop = (await this.shopRepo.getShop(shopId)) as unknown as Shop;
    if (shop) {
      const favorite = [
        ...(shop?.favorite?.filter((item) => item !== userId) ?? ""),
      ];
      await this.shopRepo.update({ favorite: [...favorite] }, shopId);
    }

    await this.repository.delete({ userId, id: store.dataValues.id });
  }
}

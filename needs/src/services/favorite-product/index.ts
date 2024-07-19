import {
  FavoriteProduct,
  FavoriteProductRepository,
  Product,
  ProductRepository,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { FavoriteProductValidation, option } from "./validation";
import { v4 as uuid } from "uuid";
export class FavoriteProductService {
  repository: FavoriteProductRepository;
  productRepo: ProductRepository;

  constructor() {
    this.repository = new FavoriteProductRepository();
    this.productRepo = new ProductRepository();
  }

  async create(input: FavoriteProduct, userId: string) {
    const { error } = FavoriteProductValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    const product = await this.productRepo.getProduct({ id: input.productId });
    if (!product) {
      throw new BadRequestError("product not found", "");
    }
    const exist = await this.repository.getFavorite({
      productId: input.productId,
      userId,
    });
    if (exist) {
      throw new BadRequestError(
        "This product already exist in your favorite list",
        ""
      );
    }
    input.id = uuid();
    await this.repository.create({
      id: input.id,
      productId: input.productId,
      userId,
      UserModelId: userId,
      ProductModelId: input.productId,
    });
    const favorite = [...(product.dataValues?.favorite ?? ""), userId];
    await this.productRepo.update(
      { id: input.productId },
      { favorite: [...favorite] }
    );
  }
  async getFavorites(userId: string) {
    return await this.repository.getFavorites({ userId });
  }
  async getFavorite(userId: string, productId: string) {
    const favorite = await this.repository.getFavorite({ userId, productId });
    if (!favorite) {
      throw new BadRequestError("favorite product not found", "");
    }
    return favorite;
  }
  async deleteFavorite(userId: string, productId: string) {
    const favorite = await this.repository.getFavorite({ userId, productId });
    if (!favorite) {
      throw new BadRequestError("favorite product not found", "");
    }
    const product = (await this.productRepo.getAnyProduct({id:productId})) as unknown as Product;
    if (product) {
      const favorite = [
        ...(product?.favorite?.filter((item) => item !== userId) ?? ""),
      ];
      await this.productRepo.update({id:productId}, { favorite: [...favorite] });
    }

    await this.repository.delete({ userId,  productId });
  }
}

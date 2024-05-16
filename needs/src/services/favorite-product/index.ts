import {
  FavoriteProduct,
  FavoriteProductRepository,
  ProductRepository,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { FavoriteProductValidation, option } from "./validation";

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
    const favorite = await this.repository.getFavorite({
      productId: input.productId,
      userId,
    });
    if (favorite) {
      throw new BadRequestError(
        "This product already exist in your favorite list",
        ""
      );
    }
  }
}

import {
  RatingRepository,
  Rating,
  Product,
  ProductRepository,
  ShopRating,
  ShopRatingModel,
  ShopRepository,
  ShopRatingRepository,
  Shop,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { ShopRatingValidation, option } from "./validation";
import { v4 as uuid } from "uuid";

export class ShopRatingService {
  private repository: ShopRatingRepository;
  private shopRepo: ShopRepository;
  constructor() {
    this.repository = new ShopRatingRepository();
    this.shopRepo = new ShopRepository();
  }
  async createRating(input: ShopRating, user: string) {
    const { error } = ShopRatingValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const shop = (await this.shopRepo.getShop(input.shopId)) as unknown as Shop;
    if (!shop) {
      throw new BadRequestError("store not found", "");
    }
    const rated = (await this.repository.findOne({
      shopId: input.shopId,
      userId: user,
    })) as unknown as ShopRating;
    if (rated) {
      throw new BadRequestError("you have already rated this product", "");
    }

    const totalRating =
      (shop.rating as number) * (shop.numRating ?? 0) + input.rating;
    const newNumRatings = (shop.numRating as number) + 1;
    const newRating = totalRating / newNumRatings;
    shop.rating = newRating;
    shop.numRating = newNumRatings;

    const update = {
      rating: newRating,
      numRating: newNumRatings,
    };
    await this.shopRepo.update(update, input.shopId);

    await this.repository.create({
      id: uuid(),
      userId: user,
      shopId: input.shopId,
      ShopModelId: input.shopId,
      UserModelId: user,
      rating: input.rating,
      comment: input.comment,
    });
    return "rating created successfully";
  }
  async getAllRating(shopId: string) {
    const ratings = await this.repository.findAll({ shopId });
    return ratings;
  }
}

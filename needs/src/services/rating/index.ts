import {
  RatingRepository,
  Rating,
  Product,
  ProductRepository,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { option } from "../validation";
import { RatingValidation } from "./validation";
import { v4 as uuid } from "uuid";

export class RatingService {
  private repository: RatingRepository;
  private productRepo: ProductRepository;
  constructor() {
    this.repository = new RatingRepository();
    this.productRepo = new ProductRepository();
  }
  async createRating(input: Rating, user: string) {
    const { error } = RatingValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    console.log(input, user);
    const product = await this.productRepo.getProduct({
      id: input.productId,
    }) as unknown as Product;
    if (!product) {
      throw new BadRequestError("product not found", "");
    }
    const rated = await this.repository.findOne({
      productId: input.productId,
      userId: user,
    });
    if (rated) {
      throw new BadRequestError("you have already rated this product", "");
    }
    const totalRating =
      (product.rating as number) * (product.numRating ?? 0) + input.rating;
    const newNumRatings = (product.numRating as number) + 1;
    const newRating = totalRating / newNumRatings;
    product.rating = newRating;
    product.numRating = newNumRatings;
    console.log(product, totalRating, newNumRatings);
    const update = {
        rating:newRating,
         numRating:newNumRatings

    }
     await this.productRepo.update( { id: input.productId }, update);

    await this.repository.create({
      id: uuid(),
      userId: user,
      productId: input.productId,
      ProductModelId: input.productId,
      UserModelId: user,
      rating: input.rating,
      comment: input.comment,
    });
    return "rating created successfully";
  }
//   async getFavoriteProduct
}

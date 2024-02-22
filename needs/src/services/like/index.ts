import { LikeValidationSchema } from "./validation";
import { LikeRepository } from "../../database/Repository";
import { v4 as uuid } from "uuid";
import { BadRequestError } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";

export class LikeService {
  private repository: LikeRepository;
  constructor() {
    this.repository = new LikeRepository();
  }
  async toggleProductLike(productId: string, userId: string): Promise<string> {
    // Check if the user has already liked the product
    const existingLike = await this.repository.find({ userId, productId });

    if (existingLike) {
      // If the user has already liked the product, unlike it
      await existingLike.destroy();
      return "product unliked"; // Product unliked
    } else {
      // If the user has not liked the product, like it
      const newLike = await this.repository.createLike({
        userId,
        productId,
        id: uuid(),
        UserModelId: userId, // Set UserModelId explicitly
        ProductModelId: productId, // Set ProductModelId explicitly
      });
      return "product liked"; // Product liked
    }
  }
  async getLikes(userId: string) {
    return await this.repository.findLike({ userId });
  }
  async getLike(userId: string, productId: string) {
    const existingLike = await this.repository.find({ userId, productId });
    if (!existingLike) {
      throw new BadRequestError("Like not found", "Bad Request");
    }
    return Utils.FormatData(existingLike);
  }
}

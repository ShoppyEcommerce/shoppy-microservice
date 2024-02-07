import { LIKE, LikeModel, ProductModel, UserModel } from "../model";

export class LikeRepository {
  async createLike(input: LIKE) {
    return await LikeModel.create(input);
  }
  async findLike(input: Partial<LIKE>) {
    return await LikeModel.findAll({
      where: input,
      include: [
        {
          model: UserModel, // Include the User model
          as: "UserModel", // Alias for the User model
        },
        {
          model: ProductModel, // Include the Product model
          as: "ProductModel", // Alias for the Product model
        },
      ],
    });
  }
  async find(input: Partial<LIKE>) {
    return await LikeModel.findOne({
      where: input,
      include: [
        {
          model: UserModel, // Include the User model
          as: "UserModel", // Alias for the User model
        },
        {
          model: ProductModel, // Include the Product model
          as: "ProductModel", // Alias for the Product model
        },
      ],
    });
  }
}

import {
  ProductModel,
  Rating,
  RatingModel,
  UserModel,
  ShopRating,
  ShopRatingModel,
  ShopModel,
} from "../model";

export class ShopRatingRepository {
  async create(input: ShopRating) {
    return await ShopRatingModel.create(input);
  }
  async findOne(input: Partial<ShopRating>) {
    return await ShopRatingModel.findOne({ where: input });
  }
  async findAll(input: Partial<ShopRating>) {
    return await ShopRatingModel.findAll({
      where: input,
      include: [
        {
          model: UserModel,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "shopDetails", "email"],
        },
      ],
    });
  }
  async update(where: Partial<ShopRating>, input: Partial<ShopRating>) {
    return await ShopRatingModel.update(input, { where, returning: true });
  }
  async delete(where: Partial<ShopRating>) {
    return await ShopRatingModel.destroy({ where });
  }
}

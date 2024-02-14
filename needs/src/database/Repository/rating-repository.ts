import { Rating, RatingModel } from "../model";

export class RatingRepository {
  async create(input: Rating) {
    return await RatingModel.create(input);
  }
  async findOne(input: Partial<Rating>) {
    return await RatingModel.findOne({ where: input });
  }
  async findAll() {
    return await RatingModel.findAll();
  }
  async update(where: Partial<Rating>, input: Partial<Rating>) {
    return await RatingModel.update(input, { where });
  }
  async delete(where: Partial<Rating>) {
    return await RatingModel.destroy({ where });
  }
}

import { ProductModel, Rating, RatingModel, UserModel } from "../model";

export class RatingRepository {
  async create(input: Rating) {
    return await RatingModel.create(input);
  }
  async findOne(input: Partial<Rating>) {
    return await RatingModel.findOne({ where: input });
  }
  async findAll(input:Partial<Rating>) {
    return await RatingModel.findAll({where:input, include:[
      {
        model:ProductModel,
        attributes:["id","name", "images"]
      },
      {
        model:UserModel,
        attributes:["id","firstName","lastName", "phone","email"]
      }
    ]});
  }
  async update(where: Partial<Rating>, input: Partial<Rating>) {
    return await RatingModel.update(input, { where , returning: true, });
  }
  async delete(where: Partial<Rating>) {
    return await RatingModel.destroy({ where });
  }
}

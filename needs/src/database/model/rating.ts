import { databaseConnection } from "../connection";
import { DataTypes, Model } from "sequelize";
import { UserModel } from "./user";
import { ProductModel } from "./product";

export interface Rating {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  UserModelId: string;
  ProductModelId: string;
  comment?: string;
}
export class RatingModel extends Model<Rating> {}

RatingModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    UserModelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ProductModelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "rating" }
);
RatingModel.belongsTo(UserModel);
RatingModel.belongsTo(ProductModel);

import { databaseConnection } from "../connection";
import { DataTypes, Model } from "sequelize";
import { UserModel } from "./user";
import { ShopModel } from "./shop";

export interface ShopRating {
  id: string;
  userId: string;
  shopId: string;
  rating: number;
  comment?: string;
  UserModelId: string;
  ShopModelId: string;
}
export class ShopRatingModel extends Model<ShopRating> {}

ShopRatingModel.init(
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
    ShopModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    UserModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    shopId: {
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
  { sequelize: databaseConnection, tableName: "shop-rating" }
);
ShopRatingModel.belongsTo(UserModel);
ShopRatingModel.belongsTo(ShopModel);

import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";
import { ProductModel } from "./product";

export interface FavoriteProduct {
  id: string;
  userId: string;
  productId: string;
  UserModelId: string;
  ProductModelId: string;
}
export class FavoriteProductModel extends Model<FavoriteProduct> {}
const favoriteSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  UserModelId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  ProductModelId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
};
FavoriteProductModel.init(favoriteSchema, {
  sequelize: databaseConnection,
  tableName: "Favorite",
});

FavoriteProductModel.belongsTo(UserModel);
FavoriteProductModel.belongsTo(ProductModel);

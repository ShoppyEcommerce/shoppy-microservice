import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

import { CategoryModel } from "./category";
import { ShopModel } from "./shop";

export interface Service {
  id: string;
  catalogue: Catelogue[];
  ratings?: number;
  latitude: number;
  longitude: number;
  location: string;
  reviews?: number;
  description: string;
  name: string;
  shopId: string;
  categoryId: string;
  image: string;
  logo: string;
  deliveryTime?: string;
  moduleId:string
}
interface Catelogue {
  image: string;
  description: string;
}

export class ServiceModel extends Model<Service> {}

ServiceModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    catalogue: {
      type: DataTypes.ARRAY(DataTypes.JSONB()),
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "CASCADE",
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "CASCADE",
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ratings: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviews: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "service" }
);

ShopModel.hasMany(ServiceModel, { foreignKey: "shopId" });
ServiceModel.belongsTo(ShopModel, { foreignKey: "shopId" });
CategoryModel.hasMany(ServiceModel, { foreignKey: "categoryId" });
ServiceModel.belongsTo(CategoryModel, { foreignKey: "categoryId" });

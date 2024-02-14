import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { VendorModel } from "./vendor";

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  moduleId: string;
  price: number;
  quantity: number;
  images: Array<string>;
  description: string;
  rating?: number;
  available: Availability;
  ownerId: string;
  numRating?: number;
}
export interface Category {
  id: string;
  name: string;
  active: boolean;
  image: string;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
  ModuleModel: ModuleModel;
}
export interface ModuleModel {
  id: string;
  name: string;
  active: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Availability {
  IN_STOCK = "In Stock",
  OUT_OF_STOCK = "Out Of Stock",
}

export class ProductModel extends Model<Product> {}

ProductModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    categoryId: { type: DataTypes.UUID },
    ownerId: { type: DataTypes.UUID, onDelete: "CASCADE" },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.UUID,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    quantity: { type: DataTypes.INTEGER, allowNull: false },
    images: { type: DataTypes.ARRAY(DataTypes.STRING) },
    available: {
      type: DataTypes.ENUM("In Stock", "Out Of Stock"),
      defaultValue: Availability.IN_STOCK,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true,
    },
    numRating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "vendor-product" }
);
//relationship between vendor and product
VendorModel.hasMany(ProductModel, { foreignKey: "ownerId" });
//relationship between module and product
ProductModel.belongsTo(VendorModel, { foreignKey: "ownerId" });

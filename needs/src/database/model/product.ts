import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { CategoryModel } from "./category";
import { ModuleModel } from "./module";
import { ShopModel } from "./shop";
//  item name
//  description
//  price
//  discount
//  discountType
//  category
//  Tag
//  attribute
//  total stock,
//  unit
//  image

export interface Product {
  id: string;
  itemName: string;
  categoryId: string;
  shopId: string;
  moduleId: string;
  price: number;
  totalStock: number;
  ItemImages: Array<string>;
  Description: string;
  rating?: number;
  available: Availability;
  ownerId: string;
  numRating?: number;
  active: boolean;
  Attribute: Array<string>;
  unit: string;
  Tag?: string;
  discountType?: string;
  discount?: number;
  Vat: number;
  Attributes: Attributes;
  vatActive: boolean;
  productSold?: number;
}
interface Attributes {
  size: string;
  color: string;
  type: string;
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
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Vat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vatActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    productSold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoryId: { type: DataTypes.UUID, onDelete: "CASCADE" },
    ownerId: { type: DataTypes.UUID, onDelete: "CASCADE" },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discountType: {
      type: DataTypes.ENUM("Percentage", "Fixed"),
      allowNull: true,
    },
    Attribute: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    Attributes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    moduleId: {
      type: DataTypes.UUID,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    totalStock: { type: DataTypes.INTEGER, allowNull: false },
    ItemImages: { type: DataTypes.ARRAY(DataTypes.STRING) },
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
    Tag:{
      type:DataTypes.STRING,
      allowNull:true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "product" }
);
//relationship between vendor and product

CategoryModel.hasMany(ProductModel, { foreignKey: "categoryId" });
ProductModel.belongsTo(CategoryModel, { foreignKey: "categoryId" });
ModuleModel.hasMany(ProductModel, { foreignKey: "moduleId" });
ProductModel.belongsTo(ModuleModel, { foreignKey: "moduleId" });
ShopModel.hasMany(ProductModel, { foreignKey: "shopId" });
ProductModel.belongsTo(ShopModel, { foreignKey: "shopId" });

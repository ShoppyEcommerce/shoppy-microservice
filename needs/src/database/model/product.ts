import { DataTypes, Model, Sequelize, Optional } from "sequelize";
import { databaseConnection } from "../connection";
import { CategoryModel } from "./category";
import { ModuleModel } from "./module";
import { ShopModel } from "./shop";

// Define attributes and creation attributes
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
  favorite?: string[];
}

interface ProductCreationAttributes extends Optional<Product, "id"> {}

export enum Availability {
  IN_STOCK = "In Stock",
  OUT_OF_STOCK = "Out Of Stock",
}

interface Attributes {
  size: string;
  color: string;
  type: string;
}

export class ProductModel
  extends Model<Product, ProductCreationAttributes>
  implements Product
{
  public id!: string;
  public itemName!: string;
  public categoryId!: string;
  public shopId!: string;
  public moduleId!: string;
  public price!: number;
  public totalStock!: number;
  public ItemImages!: Array<string>;
  public Description!: string;
  public rating?: number;
  public available!: Availability;
  public ownerId!: string;
  public numRating?: number;
  public active!: boolean;
  public Attribute!: Array<string>;
  public unit!: string;
  public Tag?: string;
  public discountType?: string;
  public discount?: number;
  public Vat!: number;
  public Attributes!: Attributes;
  public vatActive!: boolean;
  public productSold?: number;
  public favorite?: string[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
    Tag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    favorite: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "product" }
);

// Define relationships
CategoryModel.hasMany(ProductModel, { foreignKey: "categoryId" });
ProductModel.belongsTo(CategoryModel, { foreignKey: "categoryId" });
ModuleModel.hasMany(ProductModel, { foreignKey: "moduleId" });
ProductModel.belongsTo(ModuleModel, { foreignKey: "moduleId" });
ShopModel.hasMany(ProductModel, { foreignKey: "shopId" });
ProductModel.belongsTo(ShopModel, { foreignKey: "shopId" });

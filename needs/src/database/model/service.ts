import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { VendorModel } from "./vendor";
import { CategoryModel } from "./category";

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
  vendorId: string;
  categoryId: string;
  image: string;
  logo: string;
  deliveryTime?: string;
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
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "CASCADE",
    },
    categoryId: {
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

VendorModel.hasMany(ServiceModel, { foreignKey: "vendorId" });
ServiceModel.belongsTo(VendorModel, { foreignKey: "vendorId" });
CategoryModel.hasMany(ServiceModel, { foreignKey: "categoryId" });
ServiceModel.belongsTo(CategoryModel, { foreignKey: "categoryId" });

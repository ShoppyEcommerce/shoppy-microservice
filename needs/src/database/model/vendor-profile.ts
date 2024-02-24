import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";
import { VendorModel } from "./vendor";

export interface VendorProfile {
  id: string;
  image: string;
  logo: string;
  latitude: number;
  longitude: number;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
  vendorId: string;
  bankName: string;
  accountNumber: number;
  accountHolder: string;
}
export class VendorProfileModel extends Model<VendorProfile> {}
VendorProfileModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "CASCADE",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountHolder: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize: databaseConnection,
    tableName: "vendor_profiles",
    timestamps: true,
    underscored: true,
  }
);

VendorModel.hasOne(VendorProfileModel, { foreignKey: "vendorId" });
VendorProfileModel.belongsTo(VendorModel, { foreignKey: "vendorId" });

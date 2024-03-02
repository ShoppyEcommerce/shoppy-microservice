import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface SubVendor {
  id: string;
  vendorId: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  email: string;
}

export class SubVendorModel extends Model<SubVendor> {}

SubVendorModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  { sequelize: databaseConnection, tableName: "subVendors" }
);

import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";

export interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  OTP: number | null;
  role: string;
  createdAt?: Date;
  verificationCode: number;
  OTPExpirationDate: number | null;
}
export enum Role {
  ADMIN = "admin",
  USER = "user",
  VENDOR = "vendor",
  DELIVERYMAN = "deliveryman",
}

export class VendorModel extends Model<Vendor> {}

VendorModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "vendor",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OTP: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
    },
    OTPExpirationDate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    verificationCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "vendor" }
);

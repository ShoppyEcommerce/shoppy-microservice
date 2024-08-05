import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";

export interface Delivery {
  id: string;
  deliveryAddress: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  latitude: string;
  longitude: string;
  houseNumber?: string;
  floorNumber?: string;
  doorNumber?: string;
}

export class DeliveryAddress extends Model<Delivery> {}

DeliveryAddress.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    houseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    floorNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doorNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "delivery-address" }
);

UserModel.hasMany(DeliveryAddress, { foreignKey: "userId" });
DeliveryAddress.belongsTo(UserModel, { foreignKey: "userId" });

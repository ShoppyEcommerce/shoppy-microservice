import { Model, DataTypes } from "sequelize";
import { databaseConnection } from "../connection";
import { DeliveryModel } from "./delivery";

export interface DeliveryProfile {
  id: string;
  profilePicture: string;
  motorcycleImage: string;
  plateNumber: string;
  latitude: number;
  longitude: number;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
  modeOfIdentification: ModeOfIdentification;
  identityNumber: string;
  deliveryManId: string;
}

 export interface ModeOfIdentification {
  National_Id: string;
  Voters_Card: string;
  Drivers_License: string;
  International_Passport: string;
}

export class DeliveryProfileModel extends Model<DeliveryProfile> {}

DeliveryProfileModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    motorcycleImage: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    plateNumber: {
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
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modeOfIdentification: {
      type: DataTypes.ENUM,
      values: [
        "National_Id",
        "Voters_Card",
        "Drivers_License",
        "International_Passport",
      ],
      allowNull: false,
    },
    identityNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryManId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "deliveryManProfile" }
);

DeliveryProfileModel.belongsTo(DeliveryModel, { foreignKey: "deliveryManId" });
DeliveryModel.hasOne(DeliveryProfileModel, { foreignKey: "deliveryManId" });

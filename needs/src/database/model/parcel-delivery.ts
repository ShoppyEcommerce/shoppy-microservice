import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface ParcelDelivery {
  sender: Sender;
  receiver: Receiver;
  id: string;
  parcelId: string;
  distance: string;
  amount: number;
}

interface Sender {
  Door?: string;
}
interface Receiver {
  Door?: string;
}

export class ParcelDeliveryModel extends Model<ParcelDelivery> {}

ParcelDeliveryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    parcelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sender: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    distance: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "parce-delivery" }
);

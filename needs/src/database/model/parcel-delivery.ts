import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";
import { TransactionHistoryModel } from "./transaction";

export interface ParcelDelivery {
  sender: Sender;
  receiver: Receiver;
  id: string;
  ownerId:string
  parcelId: string;
  distance: string;
  amount: number;
  whoIsPaying: "Sender" | "Receiver";
  paymentMethod: PaymentDeliveryMethod;
  parcelDeliveryStatus: ParcelDeliveryStatus;
  transactionId: string;
}

interface Sender {
  Door?: string;
  address: string;
  HouseNumber: string;
  name: string;
  phoneNumber: string;
}
interface Receiver {
  Door?: string;
  name: string;
  address: string;
  HouseNumber: string;
  phoneNumber: string;
}
export enum PaymentDeliveryMethod {
  CASH_ON_DELIVERY = "Cash On Delivery",
  USER_WALLET = "User Wallet",
}
export enum ParcelDeliveryStatus {
  ONGOING = "Ongoing",
  COMPLETED = "Completed",
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
    transactionId: {
      type: DataTypes.UUID,
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
    whoIsPaying: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId:{
      type:DataTypes.UUID,
      allowNull:false
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentDeliveryMethod)),
      allowNull: false,
    },
    parcelDeliveryStatus: {
      type: DataTypes.ENUM(...Object.values(ParcelDeliveryStatus)),
    },
  },
  { sequelize: databaseConnection, tableName: "parcel-delivery" }
);
UserModel.hasMany(ParcelDeliveryModel, { foreignKey: "ownerId" });
ParcelDeliveryModel.belongsTo(UserModel, { foreignKey: "ownerId" });
ParcelDeliveryModel.belongsTo(TransactionHistoryModel, {
  foreignKey: "transactionId",
});
TransactionHistoryModel.belongsTo(ParcelDeliveryModel, {
  foreignKey: "transactionId",
});

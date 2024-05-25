import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { OrderModel, PaymentType } from "./order";
import { RiderModel } from "./rider";

export interface RiderPayment {
  id: string;
  merchant: string;
  amount: number;
  referenceId: string;
  riderId: string;
  status: RiderPaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  paymentType: PaymentType;
  type: RiderType;
  order?: string;
}
export enum RiderPaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum RiderType {
  CREDIT = "Credit",
  DEBIT = "Debit",
}

export class RiderPaymentModel extends Model<RiderPayment> {}

const RiderSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  merchant: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  riderId: {
    type: DataTypes.UUID,
    onDelete: "CASCADE",
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(RiderPaymentStatus)),
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.ENUM(...Object.values(PaymentType)),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(RiderType)),
    allowNull: false,
  },
  order: {
    type: DataTypes.UUID,
    allowNull: true,
  },
};

RiderPaymentModel.init(RiderSchema, {
  sequelize: databaseConnection,
  tableName: "rider-payment",
});
RiderModel.hasMany(RiderPaymentModel, { foreignKey: "riderId" });
RiderPaymentModel.belongsTo(RiderModel, { foreignKey: "riderId" });
OrderModel.belongsTo(RiderPaymentModel, { foreignKey: "order" });
RiderPaymentModel.belongsTo(OrderModel, { foreignKey: "order" });

import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";
import {VendorModel} from "./vendor"
import { PaymentType } from "./order";
import { TransactionHistoryModel } from "./transaction";

export interface Payment {
  id: string;
  merchant: string;
  amount: number;
  referenceId: string;
  userId: string;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  paymentType: PaymentType;
  type: Type;
}
//paymentStatus
export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}
export enum Type {
  CREDIT = "Credit",
  DEBIT = "Debit",
}

//paymentModel
export class VendorPaymentModel extends Model<Payment> implements Payment {
  id!: string;
  merchant!: string;
  amount!: number;
  referenceId!: string;
  userId!: string;
  status!: PaymentStatus;
  createdAt!: Date;
  updatedAt!: Date;
  paymentType!: PaymentType;
  type!:Type
}
//paymentSchema
const paymentSchema = {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.ENUM(...Object.values(PaymentType)),

    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(Type)),
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM,
    values: [
      PaymentStatus.PENDING,
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
    ],
    allowNull: false,
  },
};
//paymentModel init
VendorPaymentModel.init(paymentSchema, {
  sequelize: databaseConnection,
  tableName: "vendor-payment",
});
//payment relationship with user model
VendorModel.hasMany(VendorPaymentModel, { foreignKey: "userId" });
VendorPaymentModel.belongsTo(VendorModel, { foreignKey: "userId" });


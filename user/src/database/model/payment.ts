import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";

export interface Payment {
  id: string;
  merchant: string;
  amount: number;
  referenceId: string;
  userId: string;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
//paymentStatus
export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}
//paymentModel
export class PaymentModel extends Model<Payment> implements Payment {
  id!: string;
  merchant!: string;
  amount!: number;
  referenceId!: string;
  userId!: string;
  status!: PaymentStatus;
  createdAt!: Date;
  updatedAt!: Date;
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
PaymentModel.init(paymentSchema, {
  sequelize: databaseConnection,
  tableName: "payment",
});
//payment relationship with user model
UserModel.hasMany(PaymentModel, { foreignKey: "userId" });
PaymentModel.belongsTo(UserModel, { foreignKey: "userId" });

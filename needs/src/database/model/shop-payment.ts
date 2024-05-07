import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { OrderModel, PaymentType } from "./order";
import { ShopModel } from "./shop";

export interface ShopPayment {
  id: string;
  merchant: string;
  amount: number;
  referenceId: string;
  shopId: string;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  paymentType: PaymentType;
  type: Type;
  order?: string;
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
export class ShopPaymentModel extends Model<ShopPayment> implements ShopPayment {
  id!: string;
  merchant!: string;
  amount!: number;
  referenceId!: string;
  shopId!: string;
  status!: PaymentStatus;
  createdAt!: Date;
  updatedAt!: Date;
  paymentType!: PaymentType;
  type!: Type;
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
  shopId: {
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
  order: {
    type: DataTypes.UUID,
    allowNull: true,
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
ShopPaymentModel.init(paymentSchema, {
  sequelize: databaseConnection,
  tableName: "shop-payment",
});
//payment relationship with user model
ShopModel.hasMany(ShopPaymentModel, { foreignKey: "shopId" });
ShopPaymentModel.belongsTo(ShopModel, { foreignKey: "shopId" });
OrderModel.belongsTo(ShopPaymentModel, { foreignKey: "order" });
ShopPaymentModel.belongsTo(OrderModel, { foreignKey: "order" });

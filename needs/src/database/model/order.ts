import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

export interface Order {
  id: string;
 cartId:string;
  vendorId: string;
  referenceId: string;
  paymentType: PaymentType;
  userId: string;
  totalAmount: number;
  CancelOrderReason?:string
  orderStatus: OrderStatus;
}
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  image?: string[];
  totalPrice: number;
}
export enum PaymentType {
  PAYSTACK = "paystack",
  WALLET = "wallet",
  PAY_ON_DELIVERY = "pay_on_delivery",
}
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING="processing",
  IN_TRANSIT = "in_transit",
  CANCELLED = "canceled",
  DELIVERED = "delivered",
}

export class OrderModel extends Model<Order> {}
const OrderSchema = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  vendorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.ENUM,
    values: [
      PaymentType.PAYSTACK,
      PaymentType.PAY_ON_DELIVERY,
      PaymentType.WALLET,
    ],
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  orderStatus: {
    type: DataTypes.ENUM,
    values: [
      OrderStatus.PENDING,
      OrderStatus.IN_TRANSIT,
      OrderStatus.CANCELLED,
      OrderStatus.DELIVERED,
      OrderStatus.PROCESSING
    ],
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  },
  CancelOrderReason:{
    type:DataTypes.TEXT,
    allowNull:true

  }
};
OrderModel.init(OrderSchema, {
  sequelize: databaseConnection,
  tableName: "order",
});
// relationship between user model and order model
OrderModel.belongsTo(UserModel, { foreignKey: "userId" });
UserModel.hasMany(OrderModel, { foreignKey: "userId" });

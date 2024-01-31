import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

export interface Order {
  id: string;
  product: Product[];
  vendorId: string;
  referenceId: string;
  paymentType: PaymentType;
  userId: string;
  totalAmount: number;
  store: string;
  orderStatus: OrderStatus;
}
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  image: string[];
  totalPrice: number;
}
export enum PaymentType {
  CREDIT_CARD = "credit_card",
  WALLET = "wallet",
  PAY_ON_DELIVERY = "pay_on_delivery",
}
export enum OrderStatus {
  PENDING = "pending",
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
  product: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  store: {
    type: DataTypes.STRING,
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
      PaymentType.CREDIT_CARD,
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
    ],
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  },
};
OrderModel.init(OrderSchema, {
  sequelize: databaseConnection,
  tableName: "order",
});
// relationship between user model and order model
OrderModel.belongsTo(UserModel, { foreignKey: "userId" });
UserModel.hasMany(OrderModel, { foreignKey: "userId" });

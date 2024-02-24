import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";
import { DeliveryModel } from "./delivery";
import { VendorModel } from "./vendor";

export interface Order {
  id: string;
  cartId: string;
  vendorId: string;
  referenceId: string;
  paymentType: PaymentType;
  userId: string;
  totalAmount: number;
  CancelOrderReason?: string;
  orderStatus: OrderStatus;
  deliveryMan?: string;
  deliveryFee?: number;
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
  PROCESSING = "processing",
  IN_TRANSIT = "in_transit",
  CANCELLED = "canceled",
  DELIVERED = "delivered",
  RETURNED = "returned",
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
    type: DataTypes.UUID,
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
      OrderStatus.PROCESSING,
      OrderStatus.RETURNED,
    ],
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  },
  CancelOrderReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deliveryMan: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
};
OrderModel.init(OrderSchema, {
  sequelize: databaseConnection,
  tableName: "order",
});
// relationship between user model and order model
OrderModel.belongsTo(UserModel, { foreignKey: "userId" });
UserModel.hasMany(OrderModel, { foreignKey: "userId" });
OrderModel.belongsTo(DeliveryModel, { foreignKey: "deliveryMan" });
DeliveryModel.hasMany(OrderModel, { foreignKey: "deliveryMan" });
OrderModel.belongsTo(VendorModel, { foreignKey: "vendorId" });
VendorModel.hasMany(OrderModel, { foreignKey: "vendorId" });

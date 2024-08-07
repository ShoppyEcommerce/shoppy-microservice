import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

import { RiderModel } from "./rider";
import { TransactionHistoryModel } from "./transaction";
import { ShopModel } from "./shop";

export interface Order {
  id: string;
  cartId: string;
  referenceId: string;
  paymentType: PaymentType;
  userId: string;
  totalAmount: number;
  CancelOrderReason?: string;
  orderStatus: OrderStatus;
  deliveryOption: string;
  additionalNotes: string;
  address: any;
  deliveryId: string;
  deliveryFee?: number;
  riderId?: string;
  riderFee?: number;
  discount?: number;
  VatTax?: number;
  transactionId: string;
  trackingCode: number;
  shopId: string;
  createdAt?: Date;
  updatedAt?: Date;
  subTotalAmount?: number;
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
  BANK_TRANSFER = "Bank Transfer",
  CASH_ON_DELIVERY = "Cash On Delivery",
  USER_WALLET = "User Wallet",
}
export enum OrderStatus {
  PENDING = "Pending",

  CANCELED = "Canceled",

  RETURNED = "returned",

  CONFIRMED = "Confirmed",
  OUT_FOR_DELIVERY = "Out for Delivery",
  COMPLETED = "Completed",
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
  trackingCode: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  deliveryOption: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
  },

  additionalNotes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.ENUM(...Object.values(PaymentType)),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  subTotalAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orderStatus: {
    type: DataTypes.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  },
  CancelOrderReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  riderId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deliveryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  riderFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  vatTax: {
    type: DataTypes.STRING,
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

OrderModel.belongsTo(RiderModel, { foreignKey: "riderId" });
RiderModel.hasMany(OrderModel, { foreignKey: "riderId" });

TransactionHistoryModel.belongsTo(OrderModel, { foreignKey: "transactionId" });
OrderModel.belongsTo(TransactionHistoryModel, { foreignKey: "transactionId" });
ShopModel.hasMany(OrderModel, { foreignKey: "shopId" });
OrderModel.belongsTo(ShopModel, { foreignKey: "shopId" });

//end point
// - create endpoint to get today order
// - endpoint to get this week order
// -endpoint to get this month order
// -to get all order based on status
// - get lastes order

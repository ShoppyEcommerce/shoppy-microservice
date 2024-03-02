import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";
import { DeliveryModel } from "./delivery";
import { VendorModel } from "./vendor";
import order from "../../api/order";
import { TransactionHistoryModel } from "./transaction";

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
  discount?: number;
  VatTax?: number;
  transactionId: string;
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

  vendorId: {
    type: DataTypes.UUID,
    allowNull: false,
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
  deliveryMan: {
    type: DataTypes.UUID,
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
OrderModel.belongsTo(DeliveryModel, { foreignKey: "deliveryMan" });
DeliveryModel.hasMany(OrderModel, { foreignKey: "deliveryMan" });
OrderModel.belongsTo(VendorModel, { foreignKey: "vendorId" });
VendorModel.hasMany(OrderModel, { foreignKey: "vendorId" });
TransactionHistoryModel.belongsTo(OrderModel, { foreignKey: "transactionId" });
OrderModel.belongsTo(TransactionHistoryModel, { foreignKey: "transactionId" });

//end point
// - create endpoint to get today order
// - endpoint to get this week order
// -endpoint to get this month order
// -to get all order based on status
// - get lastes order

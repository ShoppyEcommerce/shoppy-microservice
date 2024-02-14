import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";


export interface VendorOrder {
  id: string;
  userId: string;
  product: Product[];
  deliveryAddress: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  VendorId: string;
}
interface Product {
  id: string;
  name: string;
  quantity: number;
  pride: number;
}
interface User {
  name: string;
  phone: string;
}
export enum OrderStatus {
  Pending = "PENDING",
  InTransit = "IN_TRANSIT",
  Cancelled = "CANCELLED",
  Delivered = "DELIVERED",
}
export class VendorOrderModel extends Model<VendorOrder> {}
const VendorOrderSchema = {
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
    type: DataTypes.JSONB,
    allowNull: false,
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orderStatus: {
    type: DataTypes.ENUM,
    values: [
      OrderStatus.Pending,
      OrderStatus.InTransit,
      OrderStatus.Cancelled,
      OrderStatus.Delivered,
    ],
    defaultValue: OrderStatus.Pending,
  },
  VendorId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};


VendorOrderModel.init(VendorOrderSchema, {
  sequelize: databaseConnection,
  tableName: "vendorOrder",
});

//relationship between  user and vendor

VendorOrderModel.belongsTo(UserModel, {foreignKey:"userId"})
UserModel.hasMany(VendorOrderModel, {foreignKey:"userId"})


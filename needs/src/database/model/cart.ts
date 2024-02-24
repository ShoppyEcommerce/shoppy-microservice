import { databaseConnection } from "../connection";
import { DataTypes, Model } from "sequelize";
import { Product } from "./product";
import { VendorModel } from "./vendor";
import { UserModel } from "./user";
import { OrderModel } from "./order";

export interface Cart {
  id: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    amount: number;
  }>;
  vendor: string;
  totalAmount: number;
  status: CartStatus;
  ownerId: string;
}
export enum CartStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export class CartModel extends Model<Cart> {}

CartModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CartStatus)),
      defaultValue: CartStatus.OPEN,
    },
    vendor: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "cart" }
);

CartModel.belongsTo(VendorModel, { foreignKey: "vendor" });
VendorModel.hasMany(CartModel, { foreignKey: "vendor" });
CartModel.belongsTo(UserModel, { foreignKey: "ownerId" });
UserModel.hasMany(CartModel, { foreignKey: "ownerId" });
CartModel.hasOne(OrderModel, {
  foreignKey: 'cartId', // Add a foreign key 'cartId' to the Order model
  onDelete: 'CASCADE', // If a cart is deleted, delete the associated order
});

// In the Order model
OrderModel.belongsTo(CartModel, { foreignKey: 'cartId' });
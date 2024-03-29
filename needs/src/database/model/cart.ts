import { databaseConnection } from "../connection";
import { DataTypes, Model } from "sequelize";
import { UserModel } from "./user";
import { OrderModel } from "./order";
import { ShopModel } from "./shop";

export interface Cart {
  id: string;
  products: Product[]

  totalAmount: number;
  status: CartStatus;
  ownerId: string;
  shopId:string
}
interface Product{
  id: string;
  itemName: string;
  Qty: number;
  amount: number;

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
    shopId:{
      type:DataTypes.UUID,
      allowNull:false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CartStatus)),
      defaultValue: CartStatus.OPEN,
    },
  
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete:"CASCADE"
    },
  },
  { sequelize: databaseConnection, tableName: "cart" }
);


CartModel.belongsTo(UserModel, { foreignKey: "ownerId" });
UserModel.hasMany(CartModel, { foreignKey: "ownerId" });
CartModel.hasOne(OrderModel, {
  foreignKey: 'cartId', // Add a foreign key 'cartId' to the Order model
  onDelete: 'CASCADE', // If a cart is deleted, delete the associated order
});
ShopModel.hasMany(CartModel, {foreignKey:"shopId"})
CartModel.belongsTo(ShopModel, {foreignKey:"shopId"})

// In the Order model
OrderModel.belongsTo(CartModel, { foreignKey: 'cartId' });
import { DataTypes, Model } from "sequelize";
import { OrderModel, OrderStatus } from "./order";
import { databaseConnection } from "../connection";
import { ShopModel } from "./shop";

export interface OrderTimeline {
  id: string;
  order: string;
  status: string;
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
  shopId: string;
}

export class OrderTimelineModel extends Model<OrderTimeline> {}

OrderTimelineModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    order: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    // },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "order_timeline",
    sequelize: databaseConnection,
  }
);

// relationship between order and order timeline
OrderTimelineModel.belongsTo(OrderModel, {
  foreignKey: "order",
});
OrderModel.hasMany(OrderTimelineModel, {
  foreignKey: "order",
});
OrderTimelineModel.belongsTo(ShopModel, { foreignKey: "shopId" });
ShopModel.hasMany(OrderTimelineModel, {
  foreignKey: "shopId",
});

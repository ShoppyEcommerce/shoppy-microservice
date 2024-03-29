import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { ShopModel } from "./shop";

export interface ShopWallet {
  id: string;
  shopId: string;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
  debit?: number;
  credit?: number;
  pin?: string;
}

export class ShopWalletModel extends Model<ShopWallet> {}

const walletSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true,
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  debit: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true,
  },
  credit: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true,
  },
};
ShopWalletModel.init(walletSchema, {
  sequelize: databaseConnection,
  tableName: "shop-wallet",
});
//relationship between wallet and user
ShopModel.hasOne(ShopWalletModel, { foreignKey: "shopId" });
ShopWalletModel.belongsTo(ShopModel, { foreignKey: "shopId" });
//relationship between wallet and transaction
// TransactionModel.hasOne(WalletModel , {foreignKey:'ownerId'})
// WalletModel.belongsTo(TransactionModel , { foreignKey:'ownerId'})
//relationship between wallet and transaction

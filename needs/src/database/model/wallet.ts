import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

export interface Wallet {
  id: string;
  ownerId: string;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
  debit?: number;
  credit?: number;
}

export class WalletModel extends Model<Wallet> {}

const walletSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
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
WalletModel.init(walletSchema, {
  sequelize: databaseConnection,
  tableName: "Wallet",
});
//relationship between wallet and user
UserModel.hasOne(WalletModel, { foreignKey: "ownerId" });
WalletModel.belongsTo(UserModel, { foreignKey: "ownerId" });
//relationship between wallet and transaction
// TransactionModel.hasOne(WalletModel , {foreignKey:'ownerId'})
// WalletModel.belongsTo(TransactionModel , { foreignKey:'ownerId'})
//relationship between wallet and transaction

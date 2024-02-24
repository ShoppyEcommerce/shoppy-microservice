import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { VendorModel } from "./vendor";

export interface Wallet {
  id: string;
  ownerId: string;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
  debit?: number;
  credit?: number;
}

export class VendorWalletModel extends Model<Wallet> {}

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
VendorWalletModel.init(walletSchema, {
  sequelize: databaseConnection,
  tableName: "vendorWallet",
});
//relationship between wallet and user
VendorModel.hasOne(VendorWalletModel, { foreignKey: "ownerId" });
VendorWalletModel.belongsTo(VendorModel, { foreignKey: "ownerId" });
//relationship between wallet and transaction
// TransactionModel.hasOne(WalletModel , {foreignKey:'ownerId'})
// WalletModel.belongsTo(TransactionModel , { foreignKey:'ownerId'})
//relationship between wallet and transaction

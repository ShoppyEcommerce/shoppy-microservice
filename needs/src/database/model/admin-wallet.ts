import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface AdminWallet {
  balance: number;
  credit: number;
  debit: number;
  id: string;
}

export class AdminWalletModel extends Model<AdminWallet> {}

AdminWalletModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    debit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    credit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  { sequelize: databaseConnection, tableName: "admin-wallet" }
);

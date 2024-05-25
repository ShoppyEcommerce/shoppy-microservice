import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { RiderModel } from "./rider";

export interface RiderWallet {
  id: string;
  riderId: string;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
  debit?: number;
  credit?: number;
  pin?: string;
}

export class RiderWalletModel extends Model<RiderWallet> {}

const walletSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  riderId: {
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
RiderWalletModel.init(walletSchema, {
  sequelize: databaseConnection,
  tableName: "rider-wallet",
});
RiderModel.hasOne(RiderWalletModel, { foreignKey: "riderId" });

RiderWalletModel.belongsTo(RiderModel, { foreignKey: "riderId" });

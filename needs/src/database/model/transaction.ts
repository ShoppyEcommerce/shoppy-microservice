import { Model, DataTypes, Optional } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentId: string;
}

export enum TransactionType {
  PURCHASE = "Purchase",
  CREDIT_WALLET = "Credit Wallet",
  FUND_BANK_ACCOUNT = "Fund Bank Account",
  CASH_ON_DELIVERY="Cash On Delivery"
}
interface product {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

interface TransactionHistoryCreationAttributes
  extends Optional<Transaction, "createdAt" | "updatedAt"> {}

export class TransactionHistoryModel
  extends Model<Transaction, TransactionHistoryCreationAttributes>
  implements Transaction
{
  id!: string;
  userId!: string;
  amount!: number;
  type!: TransactionType;
  referenceId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  description!: string;
  paymentId!: string;
}

TransactionHistoryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "TransactionHistory" }
);

// relationship between transaction and user
UserModel.hasMany(TransactionHistoryModel, { foreignKey: "userId" });
TransactionHistoryModel.belongsTo(UserModel, { foreignKey: "userId" });

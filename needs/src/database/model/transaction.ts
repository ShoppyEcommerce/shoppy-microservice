import { Model, DataTypes, Optional } from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  referenceId: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  product: product[];
}
interface product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  image: string[];
  totalPrice: number;
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
  type!: string;
  referenceId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  description!: string;
  product!: product[];
  public static readonly TYPES = ["debit", "credit"];
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
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
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
    product: {
      type: DataTypes.JSONB,
    },
  },
  { sequelize: databaseConnection, tableName: "TransactionHistory" }
);

// relationship between transaction and user
UserModel.hasMany(TransactionHistoryModel, { foreignKey: "userId" });
TransactionHistoryModel.belongsTo(UserModel, { foreignKey: "userId" });

import { Model, DataTypes } from "sequelize";
import { databaseConnection } from "../connection";

export interface Delivery {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  createdAt?: Date;
  verificationCode: number;
}

export class DeliveryModel extends Model<Delivery> {}

const deliverySchema = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "deliveryman",
  },
  verificationCode: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
};

DeliveryModel.init(deliverySchema, {
  sequelize: databaseConnection,
  tableName: "DeliveryMan",
});

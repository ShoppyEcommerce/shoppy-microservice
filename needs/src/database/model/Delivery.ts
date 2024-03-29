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
  OTP?: number | null;
  OTPExpiration?: number | null;
  OTPVerification: boolean;
  isVerified: boolean;
  status: status;
}
enum status {
  Online = "online",
  OffLine = "offline",
  OnTrip = "ontrip",
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
  OTP: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  OTPVerification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  OTPExpiration: {
    type: DataTypes.FLOAT,
    defaultValue: null,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM(),
    values: [status.OffLine, status.OnTrip, status.Online],
    defaultValue: status.Online,
  },
};

DeliveryModel.init(deliverySchema, {
  sequelize: databaseConnection,
  tableName: "deliveryMan",
});

import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

import { OrderModel } from "./order";
import { ParcelDeliveryModel } from "./parcel-delivery";
import { ParcelDelivery } from "../../api";

export interface AdminPayment {
  type: AdminType;
  id: string;
  orderId?: string;
  status: AdminPaymentStatus;
  amount: number;
  parcelDeliveryId?: string;
}
export enum AdminPaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum AdminType {
  CREDIT = "Credit",
  DEBIT = "Debit",
}

export class AdminPaymentModel extends Model<AdminPayment> {}

AdminPaymentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AdminType)),
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AdminPaymentStatus)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    parcelDeliveryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "admin-payment" }
);

AdminPaymentModel.belongsTo(OrderModel, { foreignKey: "orderId" });
OrderModel.hasMany(AdminPaymentModel, { foreignKey: "orderId" });
AdminPaymentModel.belongsTo(ParcelDeliveryModel, {
  foreignKey: "parcelDeliveryId",
});
ParcelDeliveryModel.hasMany(AdminPaymentModel, {
  foreignKey: "parcelDeliveryId",
});

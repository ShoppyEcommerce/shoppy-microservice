import { Model, DataTypes } from "sequelize";
import { databaseConnection } from "../connection";
import { ModuleModel } from "./module";

export interface Shop {
  id: string;
  phoneNumber: string;
  email: string;
  verificationCode?: number | null;
  verificationExpiration?: number | null;
  applicationReference: string;
  isVerified: boolean;
  verification: boolean;
  country?: string;
  city: string;
  state?: string;
  zipCode?: string;

  shopDetails: {
    logo: string;
    storeName: string;
    contactNumber: string;
    Address: string;
    Banner: string;
    latitude: number;
    longitude: number;
    storeAdmin: {
      firstName: string;
      lastName: string;
    };
  };
  shopSchedule: {
    Sunday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Monday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Tuesday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Wednesday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Thursday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Friday?: {
      openingTime: Date;
      closingTime: Date;
    };
    Saturday?: {
      openingTime: Date;
      closingTime: Date;
    };
  };
  DeliverySettings: {
    ScheduleOrder?: boolean;
    Delivery?: boolean;
    TakeAway?: boolean;
    MinimumProcessingTime?: string;
    ApproximateDeliveryTime?: string;
  };
}

export class ShopModel extends Model<Shop> {}

ShopModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    verificationCode: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
    },
    verificationExpiration: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    shopDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    shopSchedule: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    applicationReference: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    DeliverySettings: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  { sequelize: databaseConnection, tableName: "shop" }
);

ShopModel.belongsToMany(ModuleModel, {
  through: "shopmodule",
  as: "shop",
  foreignKey: "shop_id",
});
ModuleModel.belongsToMany(ShopModel, {
  through: "shopmodule",
  as: "module",
  foreignKey: "module_id",
});

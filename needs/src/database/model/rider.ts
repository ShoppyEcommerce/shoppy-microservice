import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";

export interface Rider {
  id: string;
  phoneNumber: string;
  email: string;
  verificationCode?: number | null;
  verificationExpiration?: number | null;
  firstName?: string;
  lastName?: string;
  referalCode?: number;
  isVerified: boolean;
  verification: boolean;
 
  vehicleDetails?: VehicleDetails;
  legalLicenseDetail?: LegalLicenseDetails;
  documentDetail?: DocumentDetails;
  availability: RiderAvailability;
  completedOrder?: number;
  onlineHoursCompleted?: number;
  acceptanceRate?: string;
  completionRate?: string;
}
export enum RiderAvailability {
  Online = "Online",
  Offline = "Offline",
}

export interface VehicleDetails {
  vehicleType: string;
  vehicleManufacturer: string;
  vehicleLicensePlate: string;
  vehicleColor: string;
}
export interface LegalLicenseDetails {
  birthDay: {
    year: string;
    month: string;
    day: string;
  };
  driverLicenseNumber: string;
  identificationNumber: string;
}

export interface DocumentDetails {
  profilePhoto: string;
  nationalIdCardFront: NationalId;
  nationalIdCardBack: NationalId;
  driverLicenseFront: NationalId;
  driverLicenseBack: NationalId;
  transportOperatorLicense: NationalId;
}

export interface NationalId {
  image: string;
  expiryDate: {
    year: string;
    month: string;
    day: string;
  };
}

export class RiderModel extends Model<Rider> {}

RiderModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    availability: {
      type: DataTypes.ENUM(...Object.values(RiderAvailability)),
      allowNull: false,
      defaultValue: RiderAvailability.Offline,
    },
    verification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    legalLicenseDetail: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    vehicleDetails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    documentDetail: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    completedOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    onlineHoursCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    acceptanceRate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completionRate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: databaseConnection,
    tableName: "rider",
  }
);

import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";
import { ModuleModel } from "./module";

export interface Parcel {
  id: string;
  name: string;
  image: string;
  moduleId: string;
}

export class ParcelModel extends Model<Parcel> {}

ParcelModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "parcels",
    sequelize: databaseConnection,
  }
);

ParcelModel.belongsTo(ModuleModel, { foreignKey: "moduleId" });
ModuleModel.hasMany(ParcelModel, { foreignKey: "moduleId" });

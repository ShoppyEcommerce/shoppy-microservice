import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

export interface Profile {
  image: string;
  id: string;
  latitude: number;
  longitude: number;
  userId: string;
  location: string;
}

export class ProfileModel extends Model<Profile> {}

const profileSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
};
ProfileModel.init(profileSchema, {
  sequelize: databaseConnection,
  tableName: "user-profile",
});
//relationship between profile and user
UserModel.hasOne(ProfileModel, { foreignKey: "userId" });
ProfileModel.belongsTo(UserModel, { foreignKey: "userId" });

import { databaseConnection } from "../connection";
import { Model, DataTypes } from "sequelize";
import { UserModel } from "./user";

;export interface Profile {
  image: string;
  id: string;
  latitude: number;
  longitude: number;
  userId: string;
  location: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  deliveryAddress?: Array<string>;
  recipient?: string
  city?:string;
  state?:string;
  country?:string

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
  recipient: { type: DataTypes.STRING,
     allowNull: true },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    onDelete: "CASCADE",
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryAddress: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  city:{
    type:DataTypes.STRING,
    allowNull:true
  },
  state:{
    type:DataTypes.STRING,
    allowNull:true
  },country:{
    type:DataTypes.STRING,
    allowNull:true

  }
  
};
ProfileModel.init(profileSchema, {
  sequelize: databaseConnection,
  tableName: "user-profile",
});
//relationship between profile and user
UserModel.hasOne(ProfileModel, { foreignKey: "userId" });
ProfileModel.belongsTo(UserModel, { foreignKey: "userId" });

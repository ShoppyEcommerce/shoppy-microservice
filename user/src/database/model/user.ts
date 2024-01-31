import { databaseConnection } from "../connection";
import {Model, DataTypes} from "sequelize"



export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword:string;
    referralCode:string;
    role:Role;
    createdAt?: Date;
    verificationCode:number,


}
export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    VENDOR = 'vendor',
    DELIVERYMAN="deliveryman"
}

export class UserModel extends  Model<User>{}

UserModel.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
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
        unique: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(Role)),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password:{
        type:DataTypes.STRING,
        allowNull:false
      },
      confirmPassword:{
        type:DataTypes.STRING,
        allowNull:false
      },
      referralCode:{
        type:DataTypes.STRING,
        allowNull:true
      },
      verificationCode:{
        type:DataTypes.INTEGER,
        allowNull:true
      }

},
    {sequelize:databaseConnection, tableName:"user"}
)


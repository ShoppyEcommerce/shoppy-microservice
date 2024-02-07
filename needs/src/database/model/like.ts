import {DataTypes, Model} from "sequelize";
import { databaseConnection } from "../connection";
import { UserModel } from "./user";
import { ProductModel } from "./product";
export interface LIKE {
    userId: string,
    productId:string,
    id:string,
    UserModelId:string,
    ProductModelId:string
  
}

export class LikeModel extends Model<LIKE> {}

LikeModel.init({
    id:{
        type:DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
    },
    userId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    UserModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    productId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    ProductModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
  
    },{sequelize:databaseConnection, tableName:"like"})

    // Define associations
    LikeModel.belongsTo(UserModel); // A like belongs to a user
    LikeModel.belongsTo(ProductModel); // A like belongs to a product
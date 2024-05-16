import { databaseConnection } from "../connection";
import {Model, DataTypes} from "sequelize"
import { UserModel } from "./user";
import { ShopModel } from "./shop";

export interface FavoriteStore {
    id:string;
    userId:string;
    shopId:string;
    UserModelId:string;
    ShopModelId:string;
}

export class FavoriteStoreModel extends Model<FavoriteStore>{}


FavoriteStoreModel.init({
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        allowNull:false
    },
    shopId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    ShopModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    UserModelId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    userId:{
        type:DataTypes.UUID,
        allowNull:false
    }
},{
    sequelize:databaseConnection, tableName:"favorite-store"
})

FavoriteStoreModel.belongsTo(UserModel)
FavoriteStoreModel.belongsTo(ShopModel)

// import { databaseConnection } from "../connection";
// import {Model, DataTypes} from "sequelize"
// import { UserModel } from "./user";
// import { ProductModel } from "./product";

// export interface Favorite {
//     id: string;
//     userId:string;
//     productId:string;
//     active:boolean
// }
// export class FavoriteModel extends Model<Favorite>{}
// const favoriteSchema =  {
//     id:{
//         type:DataTypes.UUID,
//         allowNull:false,
//         primaryKey:true,

//     },
//     userId:{
//         type:DataTypes.UUID,
//         allowNull:false,
//         onDelete: 'CASCADE',

//     },
//     productId:{
//         type:DataTypes.UUID,
//         allowNull:false,
//         onDelete: 'CASCADE',

//     },
//     active:{
//         type:DataTypes.BOOLEAN,
//         defaultValue: true
//         }
// }
// FavoriteModel.init(favoriteSchema,
// {sequelize:databaseConnection, tableName:"Favorite"});
// //relationship between favorite and user

// FavoriteModel.belongsTo(UserModel , { foreignKey:'userId'})
//     //user relationship
//     UserModel.hasMany(FavoriteModel, {foreignKey : "userId"})
// //relationship between favorite and product
// FavoriteModel.belongsTo(ProductModel , { foreignKey:'productId'})
//     //product relationship
//     ProductModel.hasMany(FavoriteModel, {foreignKey : "productId"})

import { databaseConnection } from "../connection";
import {Model, DataTypes} from "sequelize"
import { ModuleModel } from "./module";



export interface Category {
    id: string;
    name:string;
    active:boolean
    image:string
    moduleId:string


}
export class CategoryModel extends Model<Category>{}

CategoryModel.init({
    id:{
        type:DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
     
    },
    name:{
        type:DataTypes.STRING(100),
        allowNull: false
        },
        active:{
            type:DataTypes.BOOLEAN,
            defaultValue: true
            },
            image:{
                type: DataTypes.STRING,
                allowNull:false
            
            },
            moduleId:{
                type:DataTypes.UUID,
                allowNull:false,
                onDelete: 'CASCADE', 
              
            }

},
{sequelize:databaseConnection, tableName:"Category"});
//relationship between category and module
CategoryModel.belongsTo(ModuleModel , { foreignKey:'moduleId'})
    //module relationship
    ModuleModel.hasMany(CategoryModel, {foreignKey : "moduleId"})



import { databaseConnection } from "../connection";
import {Model, DataTypes} from "sequelize"



export interface Module {
    id: string;
    name:string;
    active:boolean
    image:string


}


export class ModuleModel extends  Model<Module>{}

ModuleModel.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    
      },
      name:{
        type:DataTypes.STRING,
        allowNull:false,

      },
      active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      },
      image:{
        type:DataTypes.STRING,
        allowNull:false
      }
     

},
    {sequelize:databaseConnection, tableName:"module"}
)


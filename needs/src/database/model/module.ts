import { databaseConnection } from "../connection";
import {Model, DataTypes} from "sequelize"



export interface Module {
    id: string;
    name:string;
    active:boolean
    image:string
    caption?:string
    


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
      },
      caption:{
        type:DataTypes.STRING,
        allowNull:true
      }
     

},
    {sequelize:databaseConnection, tableName:"module"}
)


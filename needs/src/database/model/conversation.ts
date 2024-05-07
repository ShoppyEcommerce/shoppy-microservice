import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface Conversation {
  id: string;
  members:Array<string>;
  senderId:string,
  receiverId:string;
   sender:Record<string, string| number| boolean>,
  receiver:Record<string, string| number| boolean>,
}


export class ConversationSchema extends Model<Conversation> {}

ConversationSchema.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
   members:{
    type:DataTypes.ARRAY(DataTypes.UUID),
    allowNull:false
   },
    senderId:{
      type:DataTypes.UUID,
      allowNull:false
    },
    receiverId:{
      type:DataTypes.UUID,
      allowNull:false
    },
    sender:{
      type:DataTypes.JSONB
    }, 
    receiver:{
      type:DataTypes.JSONB
    }
   
  },
  { sequelize: databaseConnection, tableName: "conversation" }
);

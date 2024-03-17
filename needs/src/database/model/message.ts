import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  image?:string
}

export class MessageModel extends Model<Message> {}

MessageModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image:{
      type:DataTypes.STRING,
      allowNull:true
    },
    sender: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "message" }
);

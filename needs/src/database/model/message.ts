import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
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
    senderId: {
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

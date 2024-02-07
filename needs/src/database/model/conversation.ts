import { DataTypes, Model } from "sequelize";
import { databaseConnection } from "../connection";

export interface Conversation {
  id: string;
  members: Array<string>;
}

export class ConversationSchema extends Model<Conversation> {}

ConversationSchema.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    members: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      allowNull: false,
    },
  },
  { sequelize: databaseConnection, tableName: "conversation" }
);

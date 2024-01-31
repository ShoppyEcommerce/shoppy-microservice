import { Application, json } from "express";
import cors from "cors";
import helmet from "helmet";
import { Utils } from "./utils";
import {
  Category,
  // Favorite,
  Media,
  Module,
  Order,
  // Product,
  Profile,
  User,
  appEvents,
} from "./api";

export default async (app: Application) => {
  app.use(cors());
  app.use(helmet());
  app.use(json());
  appEvents(app);
  const channel = await Utils.CreateChannel();
  User(app, channel);
  Media(app, channel);
  Module(app, channel);
  Category(app, channel);
  // Product(app, channel);
  // Favorite(app, channel);
  Profile(app, channel);
  Order(app, channel);
};

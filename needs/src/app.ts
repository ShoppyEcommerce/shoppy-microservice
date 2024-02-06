import { Application, json } from "express";
import cors from "cors";

import { Utils } from "./utils";
import {
  Category,
  Delivery,
  // Favorite,
  Media,
  Module,
  Order,
   Product,
  Profile,
  User,
  Vendor,
  VendorProfile,
  appEvents,
} from "./api";

export default async (app: Application) => {
  app.use(cors());
;
  app.use(json());
  appEvents(app);
  const channel = await Utils.CreateChannel();
  User(app, channel);
  Media(app, channel);
  Module(app, channel);
  Category(app, channel);
  Vendor(app, channel);
  Product(app, channel);
  Delivery(app, channel);
   VendorProfile(app, channel);
  // Favorite(app, channel);
  Profile(app, channel);
  Order(app, channel);
};

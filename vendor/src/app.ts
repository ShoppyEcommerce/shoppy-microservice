import { Application, json } from "express";
import cors from "cors";
import helmet from "helmet";
import { Utils } from "./utils";
import { Delivery, Product, Vendor, appEvents } from "./api";

export default async (app: Application) => {
  app.use(cors());
  app.use(helmet());
  app.use(json());
  appEvents(app);
  const channel = await Utils.CreateChannel();
  Vendor(app, channel);
  Product(app, channel);
  Delivery(app, channel);
};

import { Application, json } from "express";
import cors from "cors";// Import Socket.IO Server
import { Utils } from "./utils";
import {
  Category,
  Delivery,
  Media,
  Module,
  Order,
  Product,
  Profile,
  User,
  Vendor,
  VendorProfile,
  appEvents,
  Like,
  Conversation,
  Rating,
  Cart,
  Payment,
  Wallet
} from "./api";
import { io } from "./config/socket";

export default async (app: Application) => {
  // Create Socket.IO server and attach it to the Express app
  const httpServer = require("http").createServer(app);
  io.attach(httpServer, { cors: { origin: "*" } });
  app.use(cors());
  app.use(json());
  app.set("truest proxy", true);
  app.set("socketio", io);
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
  Profile(app, channel);
  Order(app, channel);
  Like(app, channel);
  Conversation(app, channel);
  Rating(app, channel)
  Cart(app, channel)
  Payment(app,channel)
  Wallet(app, channel)

  // Return the http server to be used by index.ts
  return httpServer;
};

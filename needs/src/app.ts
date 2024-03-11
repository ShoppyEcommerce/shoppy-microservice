import { Application, json } from "express";
import cors from "cors"; // Import Socket.IO Server
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
  Wallet,
  Service,
  SubVendor,
  VendorWallet,
  VendorPayment,
  Parcel,
  ParcelDelivery,
  DeliveryProfile,
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
  User(app);
  Media(app);
  Module(app);
  Category(app);
  Vendor(app);
  Product(app);
  Delivery(app);
  VendorProfile(app);
  Profile(app);
  Order(app);
  Like(app);
  Conversation(app);
  Rating(app);
  Cart(app);
  Payment(app);
  Wallet(app);
  Service(app);
  SubVendor(app)
  VendorWallet(app)
  VendorPayment(app)
  Parcel(app)
  ParcelDelivery(app)
  DeliveryProfile(app)

  // Return the http server to be used by index.ts
  return httpServer;
};

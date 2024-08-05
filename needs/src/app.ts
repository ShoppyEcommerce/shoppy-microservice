import { Application, json } from "express";
import cors from "cors"; // Import Socket.IO Server
import { Utils } from "./utils";
import {
  Category,
  Media,
  Module,
  Order,
  Product,
  Profile,
  User,
  appEvents,
  Like,
  Conversation,
  Rating,
  Cart,
  Payment,
  Wallet,
  Service,
  Parcel,
  ParcelDelivery,
  Message,
  Admin,
  Shop,
  ShopWallet,
  ShopPayment,
  Rider,
  ShopRating,
  FavoriteStore,
  FavoriteProduct,
  DeliveryAddress,
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

  // const channel = await Utils.CreateChannel();
  User(app);
  Media(app);
  Module(app);
  Category(app);
  ShopRating(app);
  Product(app);
  FavoriteProduct(app);
  Rider(app);
  Profile(app);
  Order(app);
  Like(app);
  Conversation(app);
  Rating(app);
  Cart(app);
  Payment(app);
  Wallet(app);
  Service(app);
  FavoriteStore(app);
  Parcel(app);
  ParcelDelivery(app);
  DeliveryAddress(app);
  Message(app);
  Admin(app);
  Shop(app);
  ShopWallet(app);
  ShopPayment(app);

  // Return the http server to be used by index.ts
  return httpServer;
};

import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { databaseConnection } from "./database";
import ExpressApp from "./app";
import { errorHandler } from "./utils/ErrorHandler/error";
import { AdminWalletService } from "./services";
import { createModule } from "./seeder";

const startServer = async () => {
  const app = express();

  databaseConnection
    .sync()
    .then(() => console.log("database connected"))
    .catch((err) => console.log(err));
  const httpServer = await ExpressApp(app);
  await new AdminWalletService().createWallet();
  await createModule();

  app.use(errorHandler);
  httpServer
    .listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    })
    .on("error", (err: Error) => {
      console.log(err);
      process.exit();
    });
};

startServer();

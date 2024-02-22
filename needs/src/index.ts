import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { databaseConnection } from "./database";
import ExpressApp from "./app";
import { errorHandler } from "./utils/ErrorHandler/error";

const startServer = async () => {
  const app = express();

  databaseConnection
    .sync()
    .then(() => console.log("database connected"))
    .catch((err) => console.log(err));
  const httpServer = await ExpressApp(app);

  app.use(
    errorHandler
    // (error: Error | any, req: Request, res: Response, next: NextFunction) => {
    //   const statusCode = error.statusCode || 500;
    //   const data = error.data || error.message;
    //   res.status(statusCode).json(data);
    // }
  );
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

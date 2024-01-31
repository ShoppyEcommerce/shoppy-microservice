import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { databaseConnection } from "./database";
import ExpressApp from "./app";

const startServer = async () => {
  const app = express();

  databaseConnection
    .sync({ alter: true })
    .then(() => console.log("database connected"))
    .catch((err) => console.log(err));
  await ExpressApp(app);

  app.use(
    (error: Error | any, req: Request, res: Response, next: NextFunction) => {
      const statusCode = error.statusCode || 500;
      const data = error.data || error.message;
      res.status(statusCode).json(data);
    }
  );
  app
    .listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    });
};

startServer();

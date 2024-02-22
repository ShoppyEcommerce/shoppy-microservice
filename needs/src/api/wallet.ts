import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { WalletService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new WalletService();

  app.post(
    "/wallet/credit",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.creditWallet(req.body.ref, req.user);
        return successHandler(res,{
          data,
          statusCode:201,
          message:"wallet credited successfully"
        })
      } catch (error) {
        next(error);
      }
    }
  );
};

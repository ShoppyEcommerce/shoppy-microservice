import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware } from "./middleware/auth";
import { OrderService } from "../services";
import { Utils } from "../utils";

export default (app: Application, channel: Channel) => {
  const service = new OrderService();
  Utils.SubscribeMessage(channel, service);
  app.post(
    "/order",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const order = await service.createOrder(
          req.body,
          req.user,
         
        );

        // Utils.PublishMessage(
        //   channel,
        //   process.env.VendorService,
        //   JSON.stringify(order)
        // );
        return res.status(201).json(order);
      } catch (error) {
        next(error);
      }
    }
  );
};

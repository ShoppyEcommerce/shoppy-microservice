import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { DeliveryService } from "../Services/delivery-service";

export default (app: Application, channel: Channel) => {
  const service = new DeliveryService();
  app.post(
    "/delivery",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const delivery = await service.createDelivery(req.body);
        return res.status(201).json(delivery);
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const delivery = await service.Login(req.body);
        return res.status(200).json(delivery);
      } catch (error) {
        next(error);
      }
    }
  );
};

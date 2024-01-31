import { Application, NextFunction, Request, Response } from "express";
import { VendorService } from "../Services/vendor-service";
import { Channel } from "amqplib";
import { Utils } from "../utils/index";

export default (app: Application, channel: Channel) => {
  const service = new VendorService();
  Utils.SubscribeMessage(channel, service);
  app.post("/register", async (req, res, next) => {
    try {
      const user = await service.createVendor(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const login = await service.Login(req.body);
        return res.status(200).json(login);
      } catch (error) {
        next(error);
      }
    }
  );
};

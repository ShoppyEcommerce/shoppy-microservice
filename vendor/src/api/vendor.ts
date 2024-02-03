import { Application, NextFunction, Request, Response } from "express";
import { VendorService } from "../Services/vendor-service";
import { Channel } from "amqplib";
import { Utils } from "../utils/index";
import { VendorAuth } from "./middleware/vendorAuth";

export default (app: Application, channel: Channel) => {
  const service = new VendorService();
  Utils.SubscribeMessage(channel, service);
  app.post("/vendor/register", async (req, res, next) => {
    try {
      const user = await service.createVendor(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/vendor/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const login = await service.Login(req.body);
        return res.status(200).json(login);
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/vendor/verify",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const user = await service.VerifyOTP(req.body, req.user)
        res.status(200).json(user);
      } catch (error) {
        next(error);
      }
    }
  );
};

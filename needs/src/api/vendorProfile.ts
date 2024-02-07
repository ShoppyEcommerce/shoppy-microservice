import { Application, NextFunction, Request, Response } from "express";
import { VendorProfileService } from "../services";
import { Channel } from "amqplib";
import { Utils } from "../utils/index";
import { VendorAuth } from "./middleware/vendorAuth";

export default (app: Application, channel: Channel) => {
  const service = new VendorProfileService();
  Utils.SubscribeMessage(channel, service);
  app.post(
    "/profile/vendor/create",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      console.log(req.body, req.user);
      try {
        const data = await service.createVendorProfile(req.body, req.user);
        return res.status(201).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile/vendor/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendorProfile(req.params.id);
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile/vendor",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendorsProfile();
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/profile/vendor/:id",
    VendorAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateVendorProfile(req.params.id, req.body);

        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/profile/vendor/:id",
    VendorAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteVendorProfile(req.params.id);
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
};

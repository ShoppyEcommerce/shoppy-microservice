import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ModuleService } from "../services/module-service";
import { Utils } from "../utils";
import { AuthMiddleware } from "./middleware/auth";

export default (app: Application, channel: Channel) => {
  const service = new ModuleService();
  Utils.SubscribeMessage(channel, service);
  app.post(
    "/module",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.createModule(req.body);
        return res.status(201).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/module/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getModule(req.params.id);
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/module",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllModule();
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/module/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateModule(
          req.params.id,
          req.body,
          "UPDATE_MODULE"
        );
        Utils.PublishMessage(
          channel,
          process.env.VendorService,
          JSON.stringify(data)
        );
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/module/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.delete(req.params.id);

        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
};

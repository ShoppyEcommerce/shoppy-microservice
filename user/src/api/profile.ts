import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ProfileService } from "../services/profile-service";
import { AuthMiddleware } from "./middleware/auth";

export default (app: Application, channel: Channel) => {
  const service = new ProfileService();
  app.post(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const profile = await service.createProfile(req.body, req.user);
        return res.status(201).json(profile);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const profile = await service.getProfile(req.user);
        return res.status(200).json(profile);
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/profile/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const profile = await service.updateProfile(id, req.body);
        return res.status(200).json(profile);
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/profile/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const profile = await service.deleteProfile(id);
        return res.status(200).json(profile);
      } catch (error) {
        next(error);
      }
    }
  );
};

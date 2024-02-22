import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ProfileService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new ProfileService();
  app.post(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createProfile(req.body, req.user);
        return successHandler(res, {
          data,
          message: "profile created successfully",
          statusCode: 201,
        });
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
        const data = await service.getProfile(req.user);
        return successHandler(res, {
          data,
          message: "profile returned successfully",
          statusCode: 200,
        });
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
        const data = await service.updateProfile(id, req.body);
        return successHandler(res, {
          data,
          message: "profile updated successfully",
          statusCode: 200,
        });
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
        const data = await service.deleteProfile(id);
        return successHandler(res, {
          data,
          message: "profile deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

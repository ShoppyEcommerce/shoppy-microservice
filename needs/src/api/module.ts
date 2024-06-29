import { Application, NextFunction, Request, Response } from "express";
import { ModuleService } from "../services";
import { Utils } from "../utils";
import { successHandler, AuthMiddleware } from "./middleware";

export default (app: Application) => {
  const service = new ModuleService();
  // Utils.SubscribeMessage(channel, service);
  app.post(
    "/module",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.createModule(req.body);
        return successHandler(res, {
          data,
          message: "module created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/module/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.getModule(req.params.id);
        return successHandler(res, {
          data,
          message: "module returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/module",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.getAllModule();
        return successHandler(res, {
          data,
          message: "module returned successfully",
          statusCode: 200,
        });
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

        return successHandler(res, {
          data,
          message: "module updated successfully",
          statusCode: 200,
        });
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
        const { data } = await service.delete(req.params.id);

        return successHandler(res, {
          data,
          message: "module deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

import { Application, NextFunction, Request, Response } from "express";
import { ServiceService } from "../services";
import { ShopAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new ServiceService();

  app.post(
    "/service",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createService(req.body, req.user);
        return successHandler(res, {
          data,
          message: "service created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/service/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getService(req.params.id);
        return successHandler(res, {
          data,
          message: "service returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/service",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllService();
        return successHandler(res, {
          data,
          message: "services returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

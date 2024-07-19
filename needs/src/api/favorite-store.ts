import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";
import { FavoriteStoreService } from "../services/favorite-store";

export default (app: Application) => {
  const service = new FavoriteStoreService();
  app.post(
    "/favorite-store",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const body = {
          ...req.body,
          userId: req.user,
        };
        const data = await service.create(req.body, req.user);
        successHandler(res, {
          data,
          message: "favorite created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/favorite-store/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getFavorite(req.params.id, req.user);
        successHandler(res, {
          data,
          message: "favorite created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/favorite-store",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getFavorites(req.user);
        successHandler(res, {
          data,
          message: "favorite created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/favorite-store/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteFavorite(req.user, req.params.id);
        successHandler(res, {
          data,
          message: "favorite removed successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

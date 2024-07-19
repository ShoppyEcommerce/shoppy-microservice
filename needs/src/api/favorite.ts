import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";
import { FavoriteProductService } from "../services";

export default (app: Application) => {
  const service = new FavoriteProductService();
  app.post(
    "/favorite-product",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.create(req.body, req.user);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "product added to favorite",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/favorite-product/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getFavorite(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "favorite product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/favorite-product",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getFavorites(req.user);
        return successHandler(res, {
          data,
          message: "favorite products returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/favorite-product/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteFavorite(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "product deleted from your favorite list",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

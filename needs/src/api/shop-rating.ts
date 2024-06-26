import { Application, NextFunction, Request, Response } from "express";
import { ShopRatingService } from "../services";

import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new ShopRatingService();

  app.post(
    "/shop-rating",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createRating(req.body, req.user);
        return successHandler(res, {
          data,
          message: "rating created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/shop-rating/shop/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllRating(req.params.id);
        return successHandler(res, {
          data,
          message: "ratings returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};


import { Application, NextFunction, Request, Response } from "express";
import { LikeService } from "../services";
import { VendorAuth, AuthMiddleware, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new LikeService();
  app.post(
    "/like",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { productId } = req.body;
        const data = await service.toggleProductLike(productId, req.user);
        return successHandler(res, {
          data,
          message: data,
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/like",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getLikes(req.user);
        return successHandler(res, {
          data,
          message: "liked product returned successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/like/:productId",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const like = await service.getLike(req.user, req.params.productId);
        return res.status(200).json(like);
      } catch (error) {
        next(error);
      }
    }
  );
};

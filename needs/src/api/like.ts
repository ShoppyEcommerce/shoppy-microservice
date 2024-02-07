import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { LikeService } from "../services";
import { AuthMiddleware } from "./middleware/auth";
import { VendorAuth } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new LikeService();
  app.post(
    "/like",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { productId } = req.body;
        const like = await service.toggleProductLike(productId, req.user);
        return res.status(201).json(like);
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
        const like = await service.getLikes(req.user);
        return res.status(200).json(like);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get("/like/:productId", AuthMiddleware.Authenticate(["user"]), async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const like = await service.getLike(req.user,req.params.productId);
      return res.status(200).json(like);
    } catch (error) {
      next(error);
    }
  })
};

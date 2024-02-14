import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { RatingService } from "../services";

import { AuthMiddleware } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new RatingService();

  app.post(
    "/rating",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const rating = await service.createRating(req.body, req.user);
        return res.status(201).json(rating);
      } catch (error) {
        next(error);
      }
    }
  );
};

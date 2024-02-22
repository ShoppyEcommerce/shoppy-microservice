import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { RatingService } from "../services";

import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new RatingService();

  app.post(
    "/rating",
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
};

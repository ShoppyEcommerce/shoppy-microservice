import { CartService } from "../services";
import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new CartService();

  app.post(
    "/cart",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createCart(req.body, req.user);
        return successHandler(res, {
          data,
          message: "cart created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/cart",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getCart(req.user);
        return successHandler(res, {
          data,
          message: "cart returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/cart/:cartId",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteCart(req.user, req.params.cartId);
        return successHandler(res, {
          data,
          message: "cart deleted successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

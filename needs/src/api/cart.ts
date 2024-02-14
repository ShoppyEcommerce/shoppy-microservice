import { CartService } from "../services";
import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new CartService();

  app.post(
    "/cart",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const cart = await service.createCart(
          req.body,
         req.user,
        );
        return res.status(201).json(cart);
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
        const cart = await service.getCart(req.user);
        return res.status(201).json(cart);
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
        const cart = await service.deleteCart(req.user, req.params.cartId);
        return res.status(201).json(cart);
      } catch (error) {
        next(error);
      }
    }
  );
};

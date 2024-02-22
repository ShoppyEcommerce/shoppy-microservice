import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, VendorAuth, successHandler } from "./middleware";
import { OrderService } from "../services";
import { Utils } from "../utils";

export default (app: Application, channel: Channel) => {
  const service = new OrderService();
  Utils.SubscribeMessage(channel, service);
  app.post(
    "/order",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createOrder(req.body, req.user);
        return successHandler(res, {
          data,
          message: "order created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllMyOrder(req.params.id, req.user);
        return successHandler(res, {
          data,
          message: "order returned successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllMyOrders(req.user);
        return successHandler(res, {
          data,
          message: "orders returned successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/user/order",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getUserOrder(req.user);
        return successHandler(res, {
          data,
          message: "Order returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/order/process/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.processOrder(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "order processing",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/order/cancel/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.CancelOrder(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "order cancelled successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

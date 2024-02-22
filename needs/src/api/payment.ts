import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";
import { PaymentService } from "../services";

export default (app: Application, channel: Channel) => {
  const service = new PaymentService();
  app.post(
    "/initialize/payment",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.initializePaystackPayment(req.body);
        return successHandler(res, {
          data,
          message: "paystack payment initiated successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/verify/payment/:ref",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.verifyTransaction(req.params.ref);
        return successHandler(res, {
          data,
          message: "paystack payment verified successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

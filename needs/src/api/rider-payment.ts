import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, RiderAuth, successHandler } from "./middleware";
import { RiderPaymentService } from "../services";

export default (app: Application) => {
  const service = new RiderPaymentService();
  app.get(
    "/rider/payment/:id",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const id = req.query.id;
        const data = await service.getPayment({ id, riderId: req.user });

        return successHandler(res, {
          data,
          message: "payment returned successfully",
          statusCode: 200,
        });
      } catch (err) {
        next(err);
      }
    }
  );
  app.get(
    "rider/payments",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getPayments(req.user);
        return successHandler(res, {
          data,
          message: "payments returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "rider/payment/all",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllRiderPayment();
        return successHandler(res, {
          data,
          message: "payments returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

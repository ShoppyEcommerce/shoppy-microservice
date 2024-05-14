import { Application, NextFunction, Request, Response } from "express";
import { DeliveryService } from "../services";
import { AuthMiddleware, GeneralAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new DeliveryService();
  app.post(
    "/delivery/register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.createDelivery(req.body);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "delivery man created successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/delivery/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const delivery = await service.Login(req.body);
        return res.status(200).json(delivery);
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/delivery/verify-Otp",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.VerifyOTP(req.body);
        return successHandler(res, {
          data,
          message: "otp verified successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/delivery/verify/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
       
        const data = await service.verifyDeliveryMan(req.params.id);
        return successHandler(res, {
          data,
          message: "deliveryman verified successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/delivery/:id",
    GeneralAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const data = await service.getDeliveryMan(id);
        return successHandler(res, {
          data,
          message: "delivery man returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/deliveryman/verified-list-all",
    GeneralAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getDeliveriesMan();
        return successHandler(res, {
          data,
          message: "delivery man returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/delivery/un-verified/list",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getUnVerifiedDelivery();
        return successHandler(res, {
          data,
          message: "delivery returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

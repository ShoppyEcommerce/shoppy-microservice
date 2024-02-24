import { Application, NextFunction, Request, Response } from "express";
import { UserService, WalletService } from "../services";
import { Channel } from "amqplib";
import { v4 as uuid } from "uuid";
import { successHandler, AuthMiddleware } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new UserService();
  app.post(
    "/register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const role = "user";
        const id = uuid();

        const {data} = await service.createUser({ ...req.body, id }, role);

        await new WalletService().createWallet(id);

        return successHandler(res, {
          data,
          statusCode: 201,
          message: "user created successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/register/admin",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const role = "admin";
        const id = uuid();

        const {data} = await service.createUser({ ...req.body, id }, role);

        return successHandler(res, {
          data,
          statusCode: 201,
          message: "admin created successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.Login(req.body);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "user login successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/verifyOtp",

    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { OTP, phone } = req.body;
        const {data} = await service.VerifyOTP({ OTP, phone });
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "user verified successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/resend-OTP",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.resendOtp(req.body);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "OTP sent successfully",
        });
      } catch (err) {
        next(err);
      }
    }
  );
  app.post(
    "/admin/vendor/verify/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.VerifyVendor(req.params.id);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "vendor verified successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

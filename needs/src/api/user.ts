import { Application, NextFunction, Request, Response } from "express";
import { UserService, WalletService } from "../services";

import { v4 as uuid } from "uuid";
import { successHandler, AuthMiddleware } from "./middleware";

export default (app: Application) => {
  const service = new UserService();
  app.post(
    "/register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const role = "user";
        const id = uuid();

        const { data } = await service.createUser({ ...req.body, id }, role);

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

        const { data } = await service.createUser({ ...req.body, id }, role);

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
        const { data } = await service.Login(req.body);
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
        const { data } = await service.VerifyOTP({ OTP, phone });
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
        const { data } = await service.resendOtp(req.body);
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
  app.put(
    "/user/send/otp/password",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.ResetOtpPasssword(req.body);

        return successHandler(res, {
          data,
          message: "reset Otp has been sent",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.put(
    "/user/reset-password",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.ResetPassword(req.body);

        return successHandler(res, {
          data,
          message: "password reset successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.put(
    "/user/change-password",
    AuthMiddleware.Authenticate(["user", "admin"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.changePassword(req.body, req.user);
        return successHandler(res, {
          data,
          message: "password updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/admin/vendor/verify/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.VerifyVendor(req.params.id);
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
  app.delete(
    "/user",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteUser(req.body, req.user);
        return successHandler(res, {
          data,
          message: "user deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

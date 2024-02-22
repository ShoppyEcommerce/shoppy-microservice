import { Application, NextFunction, Request, Response } from "express";
import { VendorService } from "../services";

import { Channel } from "amqplib";
import { Utils } from "../utils/index";
import { AuthMiddleware, GeneralAuth, VendorAuth, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new VendorService();
  Utils.SubscribeMessage(channel, service);
  app.post("/vendor/register", async (req:Request, res:Response, next:NextFunction) => {
    try {
      const data = await service.createVendor(req.body);
     return successHandler(res, {
      data,
      statusCode:201,
      message:"vendor created successfully"
     })
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/vendor/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.Login(req.body);
        return successHandler(res, {
          data,
          statusCode:201,
          message:"vendor login successfully"
         })
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/vendor/verify",
  

    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.VerifyOTP(req.body);
        return successHandler(res, {
          data,
          statusCode:201,
          message:"vendor verified successfully"
         })
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/vendor/:id",
    GeneralAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendor(req.params.id);
        return successHandler(res, {
          data,
          statusCode:200,
          message:"vendor returned successfully"
         })
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/vendor",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendors();
        return successHandler(res, {
          data,
          statusCode:200,
          message:"vendor returned successfully"
         })
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/vendor",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteVendor(req.user);
        return successHandler(res, {
          data,
          statusCode:200,
          message:"vendor deleted successfully"
         })
      } catch (error) {
        next(error);
      }
    }
  );
  app.post("/vendor/resendOTP", async (req:Request, res:Response, next:NextFunction) => {
    try {
      const data = await service.resendOtp(req.body.phone);
      return successHandler(res, {
        data,
        statusCode:200,
        message:"OTP sent successfully"
       })
      
    } catch (error) {
      next(error)
      
    }
    
  })
};

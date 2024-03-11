import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, VendorAuth, successHandler } from "./middleware";
import { PaymentService, VendorPaymentService } from "../services";

export default (app: Application) => {
  const service = new VendorPaymentService();
  app.post(
    "/vendor/initialize/payment",
   VendorAuth,
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
    "/verify/vendor/payment/:ref",
    VendorAuth,
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
  app.get(
    "/vendor/payment/bank",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getBank();
        return successHandler(res, {
          data,
          message: "bank list fetched successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/vendor/payment/recipient",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createRecipient(req.body, req.user);
        return successHandler(res, {
          data,
          message: "Recipient created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/vendor/payment/transfer",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.transferToUser(req.body, req.user);
        return successHandler(res, {
          data,
          message: "Transfer initiated successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get("/verify/account-number", async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const {account_number, bank_code} =  req.query
        const data = await service.verifyAccount({account_number, bank_code});
        return successHandler(res,{
            data,
            message:"account verified successfully",
            statusCode:200
        })
        
    } catch (error) {
        next(error)
        
    }
  })
};

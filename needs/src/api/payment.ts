import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";
import { PaymentService } from "../services";

export default (app: Application) => {
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
  app.get(
    "/payment/bank",
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
    "/payment/recipient",
    AuthMiddleware.Authenticate(["user"]),
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
    "/payment/transfer",
    AuthMiddleware.Authenticate(["user"]),
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
  app.post("/verify/bank-account", async(req:Request, res:Response, next:NextFunction) =>{
    try {

      const data =  await service.verifyAccount(req.body)

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

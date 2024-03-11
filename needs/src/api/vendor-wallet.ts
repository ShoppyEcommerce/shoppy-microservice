import { Application, NextFunction, Request, Response } from "express";
import { WalletService, VendorWalletService, PaymentService,  VendorPaymentService } from "../services";
import { AuthMiddleware, VendorAuth, successHandler } from "./middleware";
import { v4 as uuid } from "uuid";
import { PaymentStatus, PaymentType, Type } from "../database";

export default (app: Application) => {
  const service = new VendorWalletService();
  const payment = new VendorPaymentService();

  app.post(
    "/vendor/wallet/credit",
  VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.creditWallet(req.body.ref, req.user);
        console.log(req.user)
        await payment.createPayment({
          id: uuid(),
          merchant: "paystack",
          amount: data.amount,
          userId: req.user,
          referenceId: req.body.ref,
          status: PaymentStatus.SUCCESS,
          type: Type.CREDIT,
          paymentType: PaymentType.USER_WALLET,
        });
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "wallet credited successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/vendor/wallet/set-pin",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createWalletPin(req.body, req.user);
        return successHandler(res, {
          data,
          message: "pin created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch("/vendor/wallet/change-pin",  VendorAuth, async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const data = await service.changePin(req.body, req.user);
      return successHandler(res, {
        data,
        message: "pin changed successfully",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  })
};

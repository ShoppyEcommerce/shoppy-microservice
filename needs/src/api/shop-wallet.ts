import { Application, NextFunction, Request, Response } from "express";
import {
  WalletService,
  ShopWalletService,
  ShopPaymentService,
  PaymentService,
} from "../services";
import { AuthMiddleware, ShopAuth, successHandler } from "./middleware";
import { v4 as uuid } from "uuid";
import { PaymentStatus, PaymentType, Type } from "../database";

export default (app: Application) => {
  const service = new ShopWalletService();
  const payment = new ShopPaymentService();

  app.post(
    "/shop/wallet/credit",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.creditWallet(req.body.ref, req.user);
        req.user;
        await payment.createPayment({
          id: uuid(),
          merchant: "paystack",
          amount: data.amount,
          shopId: req.user,
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
    "/shop/wallet/set-pin",
    ShopAuth,
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
  app.patch(
    "/shop/wallet/change-pin",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
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
    }
  );
};

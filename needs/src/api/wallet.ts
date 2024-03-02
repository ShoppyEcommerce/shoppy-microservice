import { Application, NextFunction, Request, Response } from "express";
import { WalletService, PaymentService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";
import { v4 as uuid } from "uuid";
import { PaymentStatus, PaymentType, Type } from "../database";

export default (app: Application) => {
  const service = new WalletService();
  const payment = new PaymentService();

  app.post(
    "/wallet/credit",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.creditWallet(req.body.ref, req.user);
        await payment.createPayment({
          id: uuid(),
          merchant:"paystack",
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
};

import { Application, NextFunction, Request, Response } from "express";
import { ShopService, ShopWalletService } from "../services";
import { AuthMiddleware, ShopAuth, successHandler } from "./middleware";
import { ShopWallet } from ".";

export default (app: Application) => {
  const service = new ShopService();

  app.post(
    "/register-shop",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.register(req.body);

        await new ShopWalletService().createWallet(data.id);

        return successHandler(res, {
          data: data.message,
          message: "shop created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/login-shop",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.login(req.body);
        return successHandler(res, {
          data,
          message: "login successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/shop/verification",

    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.verifyOtp(req.body);
        return successHandler(res, {
          data,
          message: "Verification successfull",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/shop/details",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateShopDetails(req.body, req.user);
        return successHandler(res, {
          data,
          message: "shop details updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/shop/schedule",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateShopSchedule(req.body, req.user);
        return successHandler(res, {
          data,
          message: "shop updated successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/shop/delivery-setting",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateDeliverySetting(req.body, req.user);
        return successHandler(res, {
          data,
          message: "shop updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/shop/unverified",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getUnVerifiedShops();
        return successHandler(res, {
          data,
          message: "shop returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/shop/verified",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVerifiedShops();
        return successHandler(res, {
          data,
          message: "shop returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/shop/verify-shop/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.verifyShop(req.params.id);
        return successHandler(res, {
          data,
          message: "shop verified successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/shop/top-seller",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.TopSeller();
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "shop returned successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.put("/shop/update/num", ShopAuth, async(req:Request | any, res:Response, next:NextFunction) =>{
    try{
      const data =  await service.updateShop(req.user, req.body)
      successHandler(res,{
        data,
        statusCode:201,
        message:"shop updated"
      })

    }catch(err){
      next(err)
    }
  })
};

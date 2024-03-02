import { Application, NextFunction, Request, Response } from "express";
import { SubVendorService } from "../services";
import { VendorAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new SubVendorService();

  app.post(
    "/sub-vendor",
    VendorAuth,
    async (req: Request| any, res: Response, next: NextFunction) => {
      try {
        const data = await service.create(req.body, req.user);
        return successHandler(res, {
          data,
          message: "sub vendor created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

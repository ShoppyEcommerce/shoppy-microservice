import { Application, NextFunction, Request, Response } from "express";
import { ParcelDeliveryService } from "../services";
import { AuthMiddleware, GeneralAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new ParcelDeliveryService();

  app.post(
    "/parcel-delivery",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.create(req.body, req.user);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "parcel delivery created successfully",
        });
      } catch (err) {
        next(err);
      }
    }
  );
  app.get(
    "/parcel-delivery",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllParcelDelivery(req.user);
        return successHandler(res, {
          data,
          message: "parcel delivery returned",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/parcel-delivery/:parcelDeliveryId",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getParcelDelivery({
          ownerId: req.user,
          id: req.params.parcelDeliveryId,
        });
        return successHandler(res, {
          data,
          message: "parcel delivery returned",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

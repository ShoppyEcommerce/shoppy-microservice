import { Application, NextFunction, Request, Response } from "express";
import { AuthMiddleware, successHandler } from "./middleware";
import { DeliveryAddressService } from "../services";

export default (app: Application) => {
  const service = new DeliveryAddressService();
  app.post(
    "/delivery-address",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createAddress(req.body, req.user);
        return successHandler(res, {
          data,
          message: "delivery address created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/delivery-address/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;

        const data = await service.getAddress(id, req.user);
        return successHandler(res, {
          data,
          message: "delivery address returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/delivery-address",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllDeliveryAddress(req.user);

        return successHandler(res, {
          data,
          message: "delivery address returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.put(
    "/delivery-address/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateDeliveryAddress(
          req.body,
          req.user,
          req.params.id
        );
        return successHandler(res, {
          data,
          message: "delivery address updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/delivery-address/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteDeliveryAddress(
          req.params.id,
          req.user
        );
        return successHandler(res, {
          data,
          message: "delivery address deleted successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

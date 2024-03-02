import { Application, NextFunction, Request, Response } from "express";
import { VendorProfileService } from "../services";
import { Utils } from "../utils/index";
import { VendorAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new VendorProfileService();

  app.post(
    "/profile/vendor/create",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createVendorProfile(req.body, req.user);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "vendor profile created successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile/vendor",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.getVendorProfile(req.user);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "vendor returned successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile/vendor/all",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendorsProfile();
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "vendor returned successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/profile/vendor",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateVendorProfile(req.user, req.body);

        return successHandler(res, {
          data,
          statusCode: 200,
          message: "vendor profile updated successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/profile/vendor",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteVendorProfile(req.user);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "vendor deleted successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

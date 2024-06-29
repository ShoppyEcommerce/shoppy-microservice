import { Application, NextFunction, Request, Response } from "express";
import { RiderService } from "../services";
import { RiderAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new RiderService();

  app.post(
    "/rider-register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.create(req.body);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "rider created successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/rider-login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.Login(req.body);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "login successful",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/rider/verify-otp",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.verifyOtp(req.body);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "otp verified successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.patch(
    "/rider/personal-detail",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updatePersonalInformation(
          req.body,
          req.user
        );
        return successHandler(res, {
          data,
          message: "rider personal information updated",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/rider/vehicle-detail",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateVehicleDetail(req.body, req.user);
        return successHandler(res, {
          data,
          message: "rider personal information updated",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/rider/vehicle-legal-license",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateLegalLicense(req.body, req.user);
        return successHandler(res, {
          data,
          message: "rider personal information updated",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/rider/document-details",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateDocumentDetail(req.body, req.user);
        return successHandler(res, {
          data,
          message: "rider personal information updated",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/rider/go-online",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.goOnline(req.user);
        return successHandler(res, {
          data,
          message: "rider updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/rider/go-offline",
    RiderAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.goOffline(req.user);
        return successHandler(res, {
          data,
          message: "rider updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

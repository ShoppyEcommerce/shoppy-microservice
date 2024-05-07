// import { Application, NextFunction, Request, Response } from "express";
// import { VendorService } from "../services";
// import { Utils } from "../utils/index";
// import {
//   AuthMiddleware,
//   GeneralAuth,
//   VendorAuth,
//   successHandler,
// } from "./middleware";

// export default (app: Application) => {
//   const service = new VendorService();

//   app.post(
//     "/vendor/register",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.createVendor(req.body);
//         return successHandler(res, {
//           data,
//           statusCode: 201,
//           message: "vendor created successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.post(
//     "/vendor/login",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.Login(req.body);
//         return successHandler(res, {
//           data,
//           statusCode: 201,
//           message: "vendor login successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.post(
//     "/vendor/verify",

//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.VerifyOTP(req.body);
//         return successHandler(res, {
//           data,
//           statusCode: 201,
//           message: "vendor verified successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/vendor/:id",
//     GeneralAuth,
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.getVendor(req.params.id);
//         return successHandler(res, {
//           data,
//           statusCode: 200,
//           message: "vendor returned successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/vendor",
//     AuthMiddleware.Authenticate(["admin"]),
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.getVendors();
//         return successHandler(res, {
//           data,
//           statusCode: 200,
//           message: "vendor returned successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.delete(
//     "/vendor",
//     VendorAuth,
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.deleteVendor(req.user);
//         return successHandler(res, {
//           data,
//           statusCode: 200,
//           message: "vendor deleted successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.post(
//     "/vendor/resendOTP",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.resendOtp(req.body.phone);
//         return successHandler(res, {
//           data,
//           statusCode: 200,
//           message: "OTP sent successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/vendor/dashboard/statistics",
//     VendorAuth,
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.VendorDashboard(req.user);
//         return successHandler(res, {
//           data,
//           message: "vendor dashboard returned successfully",
//           statusCode: 200,
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/vendor/latest-order",
//     VendorAuth,
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.latestOrder(req.user);
//         return successHandler(res, {
//           data,
//           message: "latest order returned successfully",
//           statusCode: 200,
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/vendor/not/verified",
//     AuthMiddleware.Authenticate(["admin"]),
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.getUnVerified();
//         return successHandler(res, {
//           data,
//           message: "vendor returned successfully",
//           statusCode: 200,
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   app.put(
//     "/vendor/send/otp/password",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { data } = await service.ResetOtpPasssword(req.body);
//         return successHandler(res, {
//           data,
//           message: "reset Otp has been sent",
//           statusCode: 200,
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.put(
//     "/vendor/reset-password",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.ResetPassword(req.body);
//         return successHandler(res, {
//           data,
//           message: "password reset successfully",
//           statusCode: 200,
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.put(
//     "/vendor/change-password",
//     VendorAuth,
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const data = await service.changePassword(req.body, req.user);
//         return successHandler(res, {
//           data,
//           statusCode: 200,
//           message: "password change successfully",
//         });
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
// };

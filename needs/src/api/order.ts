
import { Application, NextFunction, Request, Response } from "express";
import {
  AuthMiddleware,
  DeliveryAuth,
  VendorAuth,
  successHandler,
} from "./middleware";
import { OrderService } from "../services";
import { Utils } from "../utils";

export default (app: Application, ) => {
  const service = new OrderService();
 
  app.post(
    "/order",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createOrder(req.body, req.user);
        return successHandler(res, {
          data,
          message: "order created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllMyOrder(req.params.id, req.user);
        return successHandler(res, {
          data,
          message: "order returned successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllMyOrders(req.user);
        return successHandler(res, {
          data,
          message: "orders returned successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/user/order",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getUserOrder(req.user);
        return successHandler(res, {
          data,
          message: "Order returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/order/process/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.processOrder(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "order processing",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/order/cancel/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.CancelOrder(req.user, req.params.id, req.body);
        return successHandler(res, {
          data,
          message: "order cancelled successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "order/delivery/accept/:id",
    DeliveryAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const data = await service.acceptOrder(req.user, id);
        return successHandler(res, {
          data,
          message: "order accepted",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order/track/user/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.TrackUserOrder(req.user, req.params.id);
        return successHandler(res, {
          data,
          message: "user order returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/order/track/user",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.TrackUserOrders(req.user);
        return successHandler(res, {
          data,
          message: "user order returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/order/delivery/confirm/:id",
    DeliveryAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.orderCompleted(req.user, req.params.id, req.body);
        return successHandler(res, {
          data,
          message: "order updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/order/user/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.receivedOrder(req.params.id, req.user);
        return successHandler(res, {
          data,
          message: "order updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/order/user/return/:id",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.returnOrder(req.params.id, req.user);

        return successHandler(res, {
          data,
          message: "order updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  // app.patch(
  //   "/order/delivery-order/:id",
  //   DeliveryAuth,
  //   async (req: Request | any, res: Response, next: NextFunction) => {
  //     try {
  //       const data = await service.DeliveredOrder(req.params.id, req.user);
  //       return successHandler(res, {
  //         data,
  //         message: "order updated successfully",
  //         statusCode: 200,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  // );
};

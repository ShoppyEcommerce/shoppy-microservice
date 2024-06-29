import { Application, NextFunction, Request, Response } from "express";
import { AdminService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";
import { Op } from "sequelize";

export default (app: Application) => {
  const service = new AdminService();
  app.get(
    "/admin/all-order",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          status,
          paymentType,
          startDate,
          endDate,
          firstName,
          lastName,
          vendorFirstName,
          vendorLastName,
          deliverymanFirstName,
          deliverymanLastName,
        } = req.query;

        // Build dynamic query object based on user inputs
        const where: any = {};
        if (
          status ||
          paymentType ||
          startDate ||
          endDate ||
          firstName ||
          lastName ||
          vendorFirstName ||
          vendorLastName ||
          deliverymanFirstName ||
          deliverymanLastName
        ) {
          where[Op.or] = [];
          if (status) where[Op.or].push({ orderStatus: status });
          if (paymentType) where[Op.or].push({ paymentType: paymentType });
          if (startDate && endDate) {
            where[Op.or].push({
              createdAt: { [Op.between]: [startDate, endDate] },
            });
          } else {
            if (startDate)
              where[Op.or].push({ createdAt: { [Op.gte]: startDate } });
            if (endDate)
              where[Op.or].push({ createdAt: { [Op.lte]: endDate } });
          }
          if (firstName) {
            where[Op.or].push({
              "$UserModel.firstName$": firstName || { [Op.not]: null },
            });
          }

          // Conditions related to the associated UserModel (lastName)
          if (lastName) {
            where[Op.or].push({
              "$UserModel.lastName$": lastName || { [Op.not]: null },
            });
          }
          if (vendorFirstName) {
            where[Op.or].push({
              "$VendorModel.firstName$": vendorFirstName || { [Op.not]: null },
            });
          }
          if (vendorLastName) {
            where[Op.or].push({
              "$VendorModel.lastName$": vendorLastName || { [Op.not]: null },
            });
          }
          if (deliverymanFirstName) {
            where[Op.or].push({
              "$DeliveryModel.firstName": deliverymanFirstName || {
                [Op.not]: null,
              },
            });
          }
          if (deliverymanLastName) {
            where[Op.or].push({
              "$DeliveryModel.lastName": deliverymanLastName || {
                [Op.not]: null,
              },
            });
          }
        }

        // const data = await OrderModel.findAll({
        //   where,
        //   include: [{ model: UserModel, as: "UserModel" }],
        // });
        const data = await service.getAllOrder(where);
        return successHandler(res, {
          data,
          message: "orders returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

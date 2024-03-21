import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import {
  VendorModel,
  UserModel,
  Vendor,
  User,
  DeliveryModel,
  Delivery,
  ProfileModel,
} from "../../database";

export const GeneralAuth = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new UnAuthorized("No token provided", "");
    }
  
    const verify = (await Utils.Decoded(token)) as JwtPayload;

   const data =  await Utils.getModel(verify.id);
    req.user = data;

    next();
  } catch (error) {
    next(error);
  }
};

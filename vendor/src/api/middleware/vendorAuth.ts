import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/app-error";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { VendorModel } from "../../database/model";

export const VendorAuth = async (
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
    const user = await VendorModel.findOne({ where: { id: verify.id } });
    if (!user) {
      throw new UnAuthorized("no user found for this token", "");
    }
    req.user = verify.id;

    next();
  } catch (error) {
    next(error);
  }
};

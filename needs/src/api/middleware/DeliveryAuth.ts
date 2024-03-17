import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { DeliveryModel } from "../../database";

export const DeliveryAuth = async (
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
    const user = await DeliveryModel.findOne({ where: { id: verify.id } });
    if (!user) {
      throw new UnAuthorized("unAuthorized pls kindly login", "");
    }
    req.user = verify.id;

    next();
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { Rider, RiderModel } from "../../database";

export const RiderAuth = async (
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
    const user = (await RiderModel.findOne({
      where: { id: verify.id },
    })) as unknown as Rider;
    if (!user) {
      throw new UnAuthorized("unAuthorized pls kindly login", "");
    }
    if (!user.verification) {
      throw new UnAuthorized("please verify your account", "");
    }
    req.user = verify.id;

    next();
  } catch (error) {
    next(error);
  }
};

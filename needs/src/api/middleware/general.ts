import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { VendorModel, UserModel, Vendor, User } from "../../database";

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
    let auth;
    const verify = (await Utils.Decoded(token)) as JwtPayload;
    auth = (await VendorModel.findOne({
      where: { id: verify.id },
    })) as Vendor | null;
    if (!auth) {
      const user = (await UserModel.findOne({
        where: { id: verify.id },
      })) as User | null;
      if (!user) {
        throw new UnAuthorized("no user found for this token", "");
      }
      auth = user;
    }
    req.user = auth.id;

    next();
  } catch (error) {
    next(error);
  }
};

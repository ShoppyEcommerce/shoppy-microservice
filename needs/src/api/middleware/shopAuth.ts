import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { ShopModel } from "../../database";

export const ShopAuth = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new UnAuthorized("No Token provided", "");
    }
    const verify = (await Utils.Decoded(token)) as JwtPayload;
    const shop = await ShopModel.findByPk(verify.id);
    if (!shop) {
      throw new UnAuthorized("unAuthorized pls kindly login", "");
    }
    if (!shop?.dataValues.verification) {
      throw new UnAuthorized("pls verify your account to proceed", "");
    }

    req.user = verify.id;
    next();
  } catch (error) {
    next(error);
  }
};

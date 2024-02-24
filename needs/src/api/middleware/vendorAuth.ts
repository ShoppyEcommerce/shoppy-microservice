import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { VendorModel, Vendor } from "../../database";

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
    const user = await VendorModel.findOne({ where: { id: verify.id } }) as unknown as Vendor
    if (!user) {
      throw new UnAuthorized("no vendor found for this token", "");
    }
    if(!user.OTPVerification){
      throw new UnAuthorized("pls verify your account with the OTP", "")
    }
    if(!user.isVerified){
      throw new UnAuthorized("pls wait for admin to verify your account", "")
    }
    req.user = verify.id;

    next();
  } catch (error) {
    next(error);
  }
};

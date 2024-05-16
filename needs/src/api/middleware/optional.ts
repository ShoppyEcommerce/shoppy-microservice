import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../../database/Repository/user-repository";
import { User } from "../../database/model";

export const OptionalAuth = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      next();
      return;
    }

    const verify = (await Utils.Decoded(token)) as JwtPayload;

    const user = (await new UserRepository().Find({
      id: verify.id,
    })) as unknown as User;
    req.user = user.id;

    next();
  } catch (error) {
    next(error);
  }
};

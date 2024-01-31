import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { JwtPayload } from "jsonwebtoken";

import { UserRepository } from "../../database/Repository/user-repository";
import { User } from "../../database/model";

export class AuthMiddleware {
  static Authenticate =
    (role: string[]) =>
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization;
        if (!token) {
          throw new UnAuthorized(
            " unauthorized No token provided",
            "Bad request"
          );
        }
        const verify = (await Utils.Decoded(token)) as JwtPayload;
        console.log(verify);

        const user = (await new UserRepository().Find({
          id: verify.id,
        })) as unknown as User;
        if (!user) {
          throw new UnAuthorized("user with this token not found", "");
        }
        console.log(role, user.role);
        if (!role.includes(user.role)) {
          throw new UnAuthorized("Unauthorized user", "");
        }

        req.user = user.id;
        next();
      } catch (error) {
        next(error);
      }
    };
}

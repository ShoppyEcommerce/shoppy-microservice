import { Application, NextFunction, Request, Response } from "express";
import { MessageService } from "../services";
import { GeneralAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new MessageService();
  app.post(
    "/message",
    GeneralAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.create({ ...req.body, sender: req.user.id });
        return successHandler(res, {
          data,
          message: "message created successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

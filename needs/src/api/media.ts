import { Application, NextFunction, Request, Response } from "express";
import { upload, uploads } from "../lib/multer";
import { MediaService } from "../services";
import { Channel } from "amqplib";
import { successHandler, GeneralAuth } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new MediaService();
  app.post(
    "/image",
    GeneralAuth,
    upload.single("images"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(req.file);
        const data = await service.uploadSingle(req.file);
        return successHandler(res, {
          data,
          message: "image uploaded successfuly",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/image/multiple",
    // GeneralAuth,
    uploads.array("images"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = req.files; // This will be an array of files
        if (!files || files.length === 0) {
          throw new Error('No files uploaded');
        }
        const data = await service.uploadMultiple(req.files as any[]);
        return successHandler(res, {
          data,
          message: "images uploaded successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

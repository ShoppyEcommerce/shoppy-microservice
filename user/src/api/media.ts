import { Application, NextFunction, Request, Response } from "express";
import { upload, uploads } from "../lib/multer";
import { MediaService } from "../services/media-service";
import { Channel } from "amqplib";

export default (app: Application, channel: Channel) => {
  const service = new MediaService();
  app.post(
    "/image",
    upload.single("images"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(req.file);
        const data = await service.uploadSingle(req.file);
        return res.status(201).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
};

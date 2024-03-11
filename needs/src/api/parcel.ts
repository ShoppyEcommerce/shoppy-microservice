import { Application, NextFunction, Request, Response } from "express";
import { ParcelService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new ParcelService();
  app.post(
    "/parcel",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.create(req.body);
        return successHandler(res, {
          data,
          message: "parcel created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/parcel",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.getAllParcel();
        return successHandler(res, {
          data,
          message: "parcel returned succesfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get("/parcel/:id", async(req:Request, res:Response, next:NextFunction)=>{
    try {
      const data =  await service.getParcel(req.params.id)
      return successHandler(res,{
        data,
        statusCode:200,
        message:"parcel returned successfully"
      })
      
    } catch (error) {
      next(error)
      
    }
  })
  app.get(
    "/parcel-search",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const search = req.query.search as string;
        console.log(search)
        const data = await service.searchParcel(search);
        return successHandler(res, {
          data,
          message: " searched parcel returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

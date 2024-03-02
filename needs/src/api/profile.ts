
import { Application, NextFunction, Request, Response } from "express";
import { ProfileService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application,) => {
  const service = new ProfileService();
  app.post(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.createProfile(req.body, req.user);
        return successHandler(res, {
          data,
          message: "profile created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.getProfile(req.user);
        return successHandler(res, {
          data,
          message: "profile returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const {data} = await service.updateProfile(req.user, req.body);
        return successHandler(res, {
          data,
          message: "profile updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/profile",
    AuthMiddleware.Authenticate(["user"]),
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const data = await service.deleteProfile(req.user);
        return successHandler(res, {
          data,
          message: "profile deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch("/profile/bank-details", AuthMiddleware.Authenticate(["user"]), async(req:Request| any, res:Response, next:NextFunction) =>{
    try {
      const data =  await service.updateBankDetails(req.body, req.user)
      return successHandler(res,{
        data,
        message:"account details updated successfully",
        statusCode:200
      })
      
    } catch (error) {
      next(error)
      
    }
  })
  app.patch("/profile/delivery-address", AuthMiddleware.Authenticate(["user"]), async(req:Request| any, res:Response, next:NextFunction) =>{
    try {
      const data =  await service.addDeliveryAddress(req.body.address, req.user)
      return successHandler(res,{
        data,
        message:"delivery address added successfully",
        statusCode:200
      })
      
    } catch (error) {
      next(error)
      
    }
  })
  app.patch("/profile/delete/address", AuthMiddleware.Authenticate(["user"]), async(req:Request| any, res:Response, next:NextFunction) =>{
    try {
      const data =  await service.removeDelivery(req.body.address, req.user)
      return successHandler(res,{
        data,
        message:"adress removed successfully",
        statusCode:200
      })
    } catch (error) {
      next(error)
    }
  }
  )
};

import { Application, NextFunction, Request, Response } from "express";
import { ConversationService } from "../services";
import { GeneralAuth, successHandler } from "./middleware";

export default (app: Application) => {
  const service = new ConversationService();
  app.post(
    "/conversation",
    GeneralAuth,
    async (req: Request| any, res: Response, next: NextFunction) => {
      try {
        const data = await service.createConversation(req.body, req.user);
        return successHandler(res,{
          data,
          message:"conversation created successfully",
          statusCode:200
        })
      } catch (error) {
        next(error);
      }
    }
  );
  app.get("/conversation", GeneralAuth, async(req:Request | any, res:Response, next:NextFunction) =>{
    try {
      const data =  await service.getUserConversation(req.user.id)
      return successHandler(res,{
        data,
        message:"conversations Returned successfully",
        statusCode:200
      })
      
    } catch (error) {
      
      next(error)
    }
    
  })
};

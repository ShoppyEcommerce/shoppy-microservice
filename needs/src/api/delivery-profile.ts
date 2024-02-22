import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { DeliveryProfileService } from "../services";
import { DeliveryAuth, successHandler } from "./middleware";


export default (app:Application, channel:Channel) =>{
const service =  new DeliveryProfileService()
app.post("/delivery/profile", DeliveryAuth, async(req:Request| any, res:Response, next:NextFunction) =>{
    try {
        const data =  await service.create(req.body, req.user)
        return successHandler(res,{
            data,
            message:"delivery man profile created successfully",
            statusCode:201

        })
        
    } catch (error) {
        next(error)
        
    }
})
app.get("/delivery/profile", DeliveryAuth, async(req:Request | any, res:Response, next:NextFunction) =>{
    try {
        const data =  await service.getDeliveryProfile(req.user)
            return successHandler(res, {
                data,
                message:"profile returned successfully",
                statusCode:200
            })
    } catch (error) {
        next(error)
        
    }

})
app.patch("/delivery/update", DeliveryAuth, async(req:Request | any, res:Response, next:NextFunction) =>{
    try {
        const data =  await service.update(req.body, req.user)
        return successHandler(res,{
            data,
            message:"profile updated successfully",
            statusCode:200
        })
    } catch (error) {
        next(error)
        
    }

})
}
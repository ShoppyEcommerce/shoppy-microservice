import { Application, NextFunction, Request, Response } from "express";
import {VendorService}  from "../Services/vendor-service"
export default (app:Application) =>{
    const service = new VendorService( )
    app.use("/app-events", async (req:Request, res:Response, next:NextFunction) =>{
        const { payload } = req.body;

        console.log("============= Vendor ================");
        console.log(payload);
        service.SubscribeEvents(payload);

        return res.status(200).json({ message: 'notified!'});
    })
}
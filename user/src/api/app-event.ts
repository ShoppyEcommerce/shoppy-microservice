import { Application, NextFunction, Request, Response } from "express";
import { ModuleService } from "../services/module-service";

export default (app:Application) =>{
    const service = new ModuleService()
    app.use("/app-events", async (req:Request, res:Response, next:NextFunction) =>{
        const { payload } = req.body;

        console.log("============= User ================");
        console.log(payload);
            service.SubscribeEvents(payload)
        return res.status(200).json({ message: 'notified!'});
    })
}
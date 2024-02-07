import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ConversationService } from "../services";
import { GeneralAuth } from "./middleware";

export default (app:Application,channel:Channel)=>{
    const service = new ConversationService();
    app.post("/conversation",GeneralAuth,async(req:Request,res:Response,next:NextFunction)=>{
        try {
            const conversation = await service.createConversation(req.body);
            return res.status(201).json(conversation);
        } catch (error) {
            next(error);
        }
    })


}
import { Application, NextFunction, Request, Response } from "express";
import { UserService } from "../services/user-service";
import { Channel } from "amqplib";
import { WalletService } from "../services/wallet-service";
import { User, UserModel } from "../database/model";
import { v4 as uuid } from "uuid";

export default (app: Application, channel: Channel) => {
  const service = new UserService();
  app.post(
    "/register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const role = "user";
        const id = uuid();

        const user = await service.createUser({ ...req.body, id }, role);

        await new WalletService().createWallet(id);

        res.status(201).json(user);
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/register/admin",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const role = "admin";
        const id = uuid();

        const user = await service.createUser({ ...req.body, id }, role);

        res.status(201).json(user);
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const login = await service.Login(req.body);
        return res.status(200).json(login);
      } catch (error) {
        next(error);
      }
    }
  );
};

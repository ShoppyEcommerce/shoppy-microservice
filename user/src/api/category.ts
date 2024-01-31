import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category-service";
import { AuthMiddleware } from "./middleware/auth";

export default (app: Application, channel: Channel) => {
  const service = new CategoryService();

  app.post(
    "/category",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const category = await service.createCategory(req.body);
        return res.status(201).json(category);
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  app.get(
    "/category",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const category = await service.getCategories();
        return res.status(200).json(category);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/category/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const category = await service.getCategory(id);
        return res.status(200).json(category);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/category/module/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const module = await service.getCategoryModule(req.params.id);
        return res.status(200).json(module);
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/category/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateCategory(req.params.id, req.body);

        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/category/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteCategory(req.params.id);

        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
};

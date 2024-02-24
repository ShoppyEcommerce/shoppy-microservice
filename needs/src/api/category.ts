import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { CategoryService } from "../services";
import { AuthMiddleware, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new CategoryService();

  app.post(
    "/category",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.createCategory(req.body);
        return successHandler(res, {
          data,
          message: "category created successfully",
          statusCode: 201,
        });
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
        const {data} = await service.getCategories();
        return successHandler(res, {
          data,
          message: "categories returned successfully",
          statusCode: 200,
        });
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
        const {data} = await service.getCategory(id);
        return successHandler(res, {
          data,
          message: "category returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/category/module/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.getCategoryModule(req.params.id);
        return successHandler(res, {
          data,
          message: "categories module returned successfully",
          statusCode: 200,
        });
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
        const {data} = await service.updateCategory(req.params.id, req.body);

        return successHandler(res, {
          data,
          message: "category updated successfully",
          statusCode: 200,
        });
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
        const {data} = await service.deleteCategory(req.params.id);

        return successHandler(res, {
          data,
          message: "category deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/search/category",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(req.query.search)
        const data = await service.searchCategory(req.query.search as string);
        return successHandler(res, {
          data,
          message: "search result returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

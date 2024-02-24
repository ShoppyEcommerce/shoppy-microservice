import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ProductService } from "../services";
import { v4 as uuid } from "uuid";
import { VendorAuth, successHandler } from "./middleware";

export default (app: Application, channel: Channel) => {
  const service = new ProductService();
  app.post(
    "/product",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const id = uuid();
        const {data} = await service.createProduct({ ...req.body, id }, req.user);
        return successHandler(res, {
          data,
          message: "product created successfully",
          statusCode: 201,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.getProducts();
        return successHandler(res, {
          data,
          message: "products returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const {data} = await service.getProduct(id);
        return successHandler(res, {
          data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/category/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const {data} = await service.getProductCategory(id);
        return successHandler(res, {
          data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/module/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const {data} = await service.getProductModule(id);
        return successHandler(res, {
          data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/product/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.updateProduct(req.params.id, req.body);
        return successHandler(res, {
          data,
          message: "product updated successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/product/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {data} = await service.deleteProduct(req.params.id);
        return successHandler(res, {
          data,
          message: "product deleted successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/vendor/me/:id",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const {data} = await service.getVendorsProduct(id, req.user);
        return successHandler(res, {
          data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/vendor/me",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data= await service.getVendorsProducts(req.user);
        return successHandler(res, {
          data: data.data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/vendor/close",

    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { latitude, longitude } = req.query;

        const data = await service.getClosestProduct({
          latitude,
          longitude,
        });
        
        if (data && data.length > 0) {
          return successHandler(res, {
            data: data[0].data,
            message: "Product returned successfully",
            statusCode: 200,
          });
        } else {
          return successHandler(res, {
            data: [],
            message: "Product returned successfully",
            statusCode: 200,
          });
        }
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/search/product",
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { search } = req.query;
        const data = await service.searchProductsAndVendors(search);
        return successHandler(res, {
          data,
          message: "product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/favorite/product/all",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("favorite");
        const data = await service.getFavorite();
        return successHandler(res, {
          data,
          message: "favorite product returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

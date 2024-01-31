import { Channel } from "amqplib";
import { Application, NextFunction, Request, Response } from "express";
import { ProductService } from "../Services/product-service";
import { v4 as uuid } from "uuid";
import { VendorAuth } from "./middleware/vendorAuth";

export default (app: Application, channel: Channel) => {
  const service = new ProductService();
  app.post(
    "/product",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const id = uuid();
        const product = await service.createProduct(
          { ...req.body, id },
          req.user
        );
        return res.status(201).json(product);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const product = await service.getProducts();
        return res.status(200).json(product);
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
        const product = await service.getProduct(id);
        return res.status(200).json(product);
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
        const product = await service.getProductCategory(id);
        return res.status(200).json(product);
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
        const product = await service.getProductModule(id);
        return res.status(200).json(product);
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/product/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.updateProduct(req.params.id, req.body);
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
  app.delete(
    "/product/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.deleteProduct(req.params.id);
        return res.status(200).json(data);
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
        const product = await service.getVendorsProduct(id, req.user);
        return res.status(200).json(product);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    "/product/vendor",
    VendorAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const product = await service.getVendorsProducts(req.user);
        return res.status(200).json(product);
      } catch (error) {
        next(error);
      }
    }
  );
};

import { Application, NextFunction, Request, Response } from "express";
import { ProductService } from "../services";
import { v4 as uuid } from "uuid";
import {
  OptionalAuth,
  ShopAuth,
  successHandler,
  AuthMiddleware,
} from "./middleware";
import { Message } from "../database/model/message";

export default (app: Application) => {
  const service = new ProductService();
  app.post(
    "/product",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const id = uuid();
        const { data } = await service.createProduct(
          { ...req.body, id },
          req.user
        );
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
        const { data } = await service.getProducts(req.query);
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
        const { data } = await service.getProduct(id);
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
        const { data } = await service.getProductCategory(id);
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
    "/product/vendor/module/:id",
    OptionalAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.getVendorModule(
          req.params.id,
          req.query,
          req.user
        );
        return successHandler(res, {
          data,
          message: "vendor returned successfully",
          statusCode: 200,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.patch(
    "/product/:id",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { data } = await service.updateProduct(
          req.params.id,
          req.user,
          req.body
        );
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
        const { data } = await service.deleteProduct(req.params.id);
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
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { data } = await service.getVendorsProduct(id, req.user);
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
    "/product/shop/me",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getVendorsProducts(req.user);
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

        // if (data && data.length > 0) {
        //   return successHandler(res, {
        //     data: data[0].data,
        //     message: "Product returned successfully",
        //     statusCode: 200,
        //   });
        // } else {
        //   return successHandler(res, {
        //     data: [],
        //     message: "Product returned successfully",
        //     statusCode: 200,
        //   });
        // }
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
  app.get("/search/product-with-category/:categoryId", async (req:Request| any, res:Response, next:NextFunction) =>{
    try {
      const {categoryId} = req.params
      const {search} = req.query
      const data =  await service.searchProductWithCategoryId(categoryId, search)
      return successHandler(res,{
        data,
        message:"product returned successfully",
        statusCode:200
      })
      
    } catch (error) {
      next(error)
      
    }
  })
  app.get(
    "/favorite/product/all",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
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
  app.get(
    "/product/shop/:id",
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const data = await service.getProductByShopId(req.params.id, req.query);
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
  // app.get(
  //   "/product/newest/arrival",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const data = await service.getLatestProduct();
  //       return successHandler(res, {
  //         data,
  //         statusCode: 200,
  //         message: "product returned successful",
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  // );
  app.put(
    "/product/toggle-visibility/:id",
    ShopAuth,
    async (req: Request | any, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const user = req.user;

        const data = await service.toggleVisibleProduct(id, user, req.body);
        return successHandler(res, {
          data,
          statusCode: 201,
          message: "product updated successfully",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.patch(
    "/product/toggle/vat-active/:id",
    AuthMiddleware.Authenticate(["admin"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await service.toggleVatActive(req.params.id, req.body);
        return successHandler(res, {
          data,
          statusCode: 200,
          message: "product updated successfully",
        });
      } catch (err) {
        next(err);
      }
    }
  );
};

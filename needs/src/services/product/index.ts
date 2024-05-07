import axios, { AxiosError } from "axios";

import {
  BadRequestError,
  UnAuthorized,
  ValidationError,
} from "../../utils/ErrorHandler";
import * as geolib from "geolib";
import {
  ClosestProductSchema,
  ProductSchema,
  UpdateProductSchema,
  option,
} from "./validation";
import { Utils } from "../../utils";
import {
  Category,
  Product,
  ProductModel,
 
  ProductRepository,
  CategoryRepository,

  ModuleModel,
  CategoryModel,

  ShopRepository,
  Shop,
  ShopModel,
  databaseConnection,
} from "../../database";
import sequelize, { Op } from "sequelize";

interface IProduct {
  categoryId: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<string>;
  description: string;
}

export class ProductService {
  private repository: ProductRepository;
  private categoryRepository: CategoryRepository;
  private shopRepository: ShopRepository;
  constructor() {
    this.repository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.shopRepository = new ShopRepository();
  }
  async createProduct(input: Product, user: string) {
    const { error, value } = ProductSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const category = (await this.categoryRepository.Find({
      id: value.categoryId,
    })) as unknown as Category;
    if (!category) {
      throw new BadRequestError("This category does not exist", "");
    }
    // const vendor = (await this.vendorRepo.Find({
    //   id: user,
    // })) as unknown as Vendor;
    const shop = await this.shopRepository.getShop(user);
    console.log(shop);
    if (!shop?.dataValues.isVerified) {
      throw new UnAuthorized("you are not verified", "");
    }

   

    value.itemName = Utils.Capitalizeword(value.itemName);
    const exist = await this.repository.getProduct({
      itemName: value.itemName,
      shopId: user,
    });
    if (exist) {
      throw new BadRequestError("This product already exist for this shop", "");
    }

    value.category = category;
    value.moduleId = category.moduleId;
    value.shopId = user;

    const product = await this.repository.create(value);
    try {
      const select = `SELECT * FROM shopmodule WHERE shop_id = '${user}' AND module_id = '${category.moduleId}' LIMIT 1`;
      const shopModule = await databaseConnection.query(select, {});
     

      const shopModuleLength = Number(shopModule.length);
      if (shopModule[0].length === 0) {
        const query = `
     INSERT INTO shopmodule (shop_id, module_id, "createdAt", "updatedAt")
     VALUES (?, ?, NOW(), NOW())
     `;

        // Execute the SQL query
        const [result]: [any, any] = await databaseConnection.query(query, {
          replacements: [user, category.moduleId],
        });
        console.log(result)

        // // Check if the insertion was successful
        if (result && result.affectedRows > 0) {
          console.log("Value inserted into shopModule table successfully.");
        } else {
          console.error("Error inserting value into shopModule table.");
        }
      }
    } catch (error) {
      console.error("Error inserting into shopModule table:", error);
    }

    return Utils.FormatData(product);
  }
  async getProduct(id: string) {
    const product = await this.repository.getProduct({ id });
    if (!product) {
      throw new BadRequestError("This product does not exist", "");
    }
    return Utils.FormatData(product);
  }
  async getProducts() {
    const product = await this.repository.getProducts();
    return Utils.FormatData(product);
  }
  async getProductCategory(id: string) {
    const product = await this.repository.getProductCategory(id);
    return Utils.FormatData(product);
  }
  async getProductModule(id: string) {
    const product = await this.repository.getProductModule(id);
    return Utils.FormatData(product);
  }
  async getVendorModule(id: string) {
    const query = `
      SELECT * FROM  shopmodule   JOIN  shop ON shop.id = shopmodule.shop_id JOIN  module ON module.id = shopmodule.module_id WHERE  module_id= ? `;
    const shopModule = await databaseConnection.query(query, {
      replacements: [id],
    });


    return Utils.FormatData(shopModule[0]);
  }
  async updateProduct(id: string, shopId: string, update: any) {
    const { error, value } = UpdateProductSchema.validate(update, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const exist = await this.repository.getProduct({ id, shopId });
    if (!exist) {
      throw new BadRequestError("This product does not exist", "");
    }
    const product = await this.repository.update({ id }, value);
    return Utils.FormatData(product[1][0].dataValues);
  }
  async deleteProduct(id: string) {
    const exist = await this.repository.getProduct({ id });
    if (!exist) {
      throw new BadRequestError("This product does not exist", "");
    }
    const product = await this.repository.delete({ id });
    return Utils.FormatData(product);
  }
  async getVendorsProduct(id: string, user: string) {
    const product = await this.repository.getProduct({ id, shopId: user });
    if (!product) {
      throw new BadRequestError("product not found", "");
    }
    return Utils.FormatData(product);
  }
  async getVendorsProducts(user: string) {
    const product = await this.repository.getVendorsProducts(user);
    return Utils.FormatData(product);
  }
  async getClosestProduct(input: { latitude: number; longitude: number }) {
    try {
      const { error } = ClosestProductSchema.validate(input, option);
      if (error) {
        throw new ValidationError(error.details[0].message, "");
      }
      const profiles =
        (await this.shopRepository.getAllShop()) as unknown as Shop[];
      const shops: string[] = [];
      if (profiles.length > 0) {
        profiles.map((profile: Shop) => {
          const valid = geolib.isPointWithinRadius(
            { latitude: input.latitude, longitude: input.longitude },
            { latitude: profile.shopDetails.latitude, longitude: profile.shopDetails.longitude },
            10000
          );
          valid && shops.push(profile.id);
        });
        if (shops.length === 0) {
          return [];
        }
        const product = shops.map((vendor) =>
          this.getVendorsProducts(vendor)
        );

        const close = await Promise.all(product);
        return close;
      }
    } catch (error) {
      throw new BadRequestError(error as string, "");
    }
  }
  async searchProductsAndVendors(input: string) {
    const products = await ProductModel.findAll({
      where: { itemName: { [Op.like]: `%${input}%` } },
    });
    // const vendors = await VendorModel.findAll({
    //   where: {
    //     [Op.or]: [
    //       { firstName: { [Op.like]: `%${input}%` } },
    //       { lastName: { [Op.like]: `%${input}%` } },
    //     ],
    //   },
    //   include: ProductModel,
    // });
    return { products };
  }
  async RatingProduct(productId: string, rating: number) {
    const product = (await ProductModel.findByPk(
      productId
    )) as unknown as Product;
    if (!product) {
      throw new BadRequestError("product not found", "");
    }
    // Calculate new rating based on existing rating and number of ratings
    const totalRating =
      (product.rating as number) * (product.numRating ?? 0) + rating;

    const newNumRatings = (product.numRating as number) + 1;
    const newRating = totalRating / newNumRatings;

    // Update the product's rating and numRatings fields
    product.rating = newRating;
    product.numRating = newNumRatings;

    // Save the updated product
    await this.repository.update(product, { id: productId });
  }

  async getFavorite() {
    const favorite = await ProductModel.findAll({
      limit: 10,
      order: [["rating", "DESC"]],
    });

    return favorite;
  }
}

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
  Vendor,
  VendorModel,
  VendorProfile,
  ProductRepository,
  CategoryRepository,
  VendorProfileRepository,
  VendorRepository,
} from "../../database";
import { Op } from "sequelize";

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
  private vendorProfile: VendorProfileRepository;
  private vendorRepo: VendorRepository;
  constructor() {
    this.repository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.vendorProfile = new VendorProfileRepository();
    this.vendorRepo = new VendorRepository();
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
    const vendor = (await this.vendorRepo.Find({
      id: user,
    })) as unknown as Vendor;

    if (!vendor.isVerified) {
      throw new UnAuthorized("you are not verified", "");
    }

    const profile = await this.vendorProfile.getVendorProfile(user);
    if (!profile) {
      throw new BadRequestError("pls create a profile first", "Bad Request");
    }
    value.itemName =  Utils.Capitalizeword(value.itemName);
    const exist =  await this.repository.getProduct({itemName: value.itemName, ownerId: user});
    if (exist) {
      throw new BadRequestError("This product already exist for this vendor", "");
    }

    value.category = category;
    value.moduleId = category.moduleId;
    value.ownerId = user;
    
    const product = await this.repository.create(value);
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
  async updateProduct(id: string, update: any) {
    const { error, value } = UpdateProductSchema.validate(update, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const exist = await this.repository.getProduct({ id });
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
    const product = await this.repository.getProduct({ id, ownerId: user });
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
        (await this.vendorProfile.findAll()) as unknown as VendorProfile[];
      const vendors: string[] = [];
      if (profiles.length > 0) {
        profiles.map((profile: VendorProfile) => {
          const valid = geolib.isPointWithinRadius(
            { latitude: input.latitude, longitude: input.longitude },
            { latitude: profile.latitude, longitude: profile.longitude },
            10000
          );
          valid && vendors.push(profile.vendorId);
        });
        if (vendors.length === 0) {
          return [];
        }
        const product = vendors.map((vendor) =>
          this.getVendorsProducts(vendor)
        );

        const close =  await Promise.all(product);
        return close
      }
    } catch (error) {
      throw new BadRequestError(error as string, "");
    }
  }
  async searchProductsAndVendors(
    input: string
  ) {
    const products = await ProductModel.findAll({
      where: { itemName: { [Op.like]: `%${input}%` } },
    });
    const vendors = await VendorModel.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${input}%` } },
          { lastName: { [Op.like]: `%${input}%` } },
        ],
      },
      include: ProductModel,
    });
    return { products, vendors };
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

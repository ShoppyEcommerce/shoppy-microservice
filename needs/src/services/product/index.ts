import axios, { AxiosError } from "axios";
import {
  ProductRepository,
  CategoryRepository,
  VendorProfileRepository,
  VendorRepository,
} from "../../database/Repository";
import {
  BadRequestError,
  UnAuthorized,
  ValidationError,
} from "../../utils/ErrorHandler";
import * as geolib from "geolib";
import { ProductSchema, UpdateProductSchema, option } from "./validation";
import { Utils } from "../../utils";
import {
  Category,
  ProductModel,
  Vendor,
  VendorModel,
} from "../../database/model";
import {
  VendorProfile,
  VendorProfileModel,
} from "../../database/model/vendorProfile";

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
  async createProduct(input: IProduct, user: string) {
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

    // try {

    //   const category = await axios.get(
    //     `http://localhost:8002/category/${input.categoryId}`
    //   );
    //   value.category = category.data.data;
    //   value.moduleId = category.data.data.ModuleModel.id;
    // } catch (error) {
    //   const err = error as AxiosError;
    //   throw new BadRequestError(`${err.response?.data}`, "");
    // }
    value.category = category;
    value.moduleId = category.moduleId;
    value.ownerId = user;
    value.name = Utils.Capitalizeword(value.name);
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
    return Utils.FormatData(product);
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
  async getClosestProduct(input: {
    latitude: number;
    longitude: number;
    id: string;
  }) {
    try {
      const profiles =
        (await this.vendorProfile.findAll()) as unknown as VendorProfile[];
      const vendors: string[] = [];
      if(profiles.length > 0){

        profiles.map((profile: VendorProfile) => {
          const valid = geolib.isPointWithinRadius(
            { latitude: input.latitude, longitude: input.longitude },
            { latitude: profile.latitude, longitude: profile.longitude },
            5000
          );
          valid && vendors.push(profile.vendorId);
        });
        if(vendors.length === 0){
          return []
        }
       const product =  vendors.map(vendor => this.getVendorsProducts(vendor))
  
       return await Promise.all(product)
      }
    } catch (error) {
      throw new BadRequestError(error as string, "");
    }
  }
}

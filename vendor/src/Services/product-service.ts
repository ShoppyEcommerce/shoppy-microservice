import axios, { AxiosError } from "axios";
import { ProductRepository } from "../database/Repository/product-repository";
import { BadRequestError, ValidationError } from "../utils/app-error";
import { ProductSchema, UpdateProductSchema, option } from "./validation";
import { Utils } from "../utils";

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
  constructor() {
    this.repository = new ProductRepository();
  }
  async createProduct(input: IProduct, user: string) {
    const { error, value } = ProductSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    try {
      const category = await axios.get(
        `http://localhost:8002/category/${input.categoryId}`
      );
      value.category = category.data.data;
      value.moduleId = category.data.data.ModuleModel.id;
    } catch (error) {
      const err = error as AxiosError;
      throw new BadRequestError(`${err.response?.data}`, "");
    }
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
}

import { Product, ProductModel, VendorModel } from "../model";

export class ProductRepository {
  async create(input: Product) {
    const product = await ProductModel.create(input);
    return product;
  }
  async getProduct(input: Record<string, string>) {
    const product = await ProductModel.findOne({
      where: input,
      include: [{
        model:VendorModel,
        attributes:["id", "firstName","lastName","email", "phone"]
      }],
    });
    return product;
  }
  async getProducts() {
    return ProductModel.findAll({  include: [{
      model:VendorModel,
      attributes:["id", "firstName","lastName","email", "phone"]
    }], });
  }
  async getProductCategory(id: string) {
    return ProductModel.findAll({
      where: { categoryId: id },
      include: [{
        model:VendorModel,
        attributes:["id", "firstName","lastName","email", "phone"]
      }],
    });
  }
  async getProductModule(id: string) {
    return ProductModel.findAll({
      where: { moduleId: id },
      include: [{
        model:VendorModel,
        attributes:["id", "firstName","lastName","email", "phone"]
      }],
    });
  }
  async update(input: { id: string }, update: any) {
   return await ProductModel.update(update, { where: input, returning: true, });
   
  }
  async delete(input: { id: string }) {
    await ProductModel.destroy({ where: input });
    return "product deleted";
  }

  async getVendorsProducts(id: string) {
    return await ProductModel.findAll({ where: { ownerId: id } });
  }
}

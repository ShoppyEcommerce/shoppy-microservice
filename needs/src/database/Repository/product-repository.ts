import { Product, ProductModel, VendorModel } from "../model";

export class ProductRepository {
  async create(input: Product) {
    const product = await ProductModel.create(input);
    return product;
  }
  async getProduct(input: Record<string, string>) {
    const product = await ProductModel.findOne({
      where: input,
      include: [VendorModel],
    });
    return product;
  }
  async getProducts() {
    return ProductModel.findAll({ include: [VendorModel] });
  }
  async getProductCategory(id: string) {
    return ProductModel.findAll({
      where: { categoryId: id },
      include: [VendorModel],
    });
  }
  async getProductModule(id: string) {
    return ProductModel.findAll({
      where: { moduleId: id },
      include: [VendorModel],
    });
  }
  async update(input: { id: string }, update: any) {
    await ProductModel.update(update, { where: input });
    return "product updated";
  }
  async delete(input: { id: string }) {
    await ProductModel.destroy({ where: input });
    return "product deleted";
  }

  async getVendorsProducts(id: string) {
    return await ProductModel.findAll({ where: { ownerId: id } });
  }
}

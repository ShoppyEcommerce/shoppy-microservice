import {
  CategoryModel,
  ModuleModel,
  Product,
  ProductModel,
  ShopModel,
} from "../model";

export class ProductRepository {
  async create(input: Product) {
    const product = await ProductModel.create(input);
    return product;
  }
  async getProduct(input: Record<string, string>) {
    const product = await ProductModel.findOne({
      where: { ...input, active: true },
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
        {
          model: CategoryModel,
          attributes: ["id", "name", "image"],
        },
        {
          model: ModuleModel,
          attributes: ["id", "name", "image"],
        },
      ],
    });
    return product;
  }
  async getProducts() {
    return ProductModel.findAll({
      where: {
        active: true,
      },
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
        {
          model: CategoryModel,
          attributes: ["id", "name", "image"],
        },
        {
          model: ModuleModel,
          attributes: ["id", "name", "image"],
        },
      ],
    });
  }
  async getProductCategory(id: string) {
    return ProductModel.findAll({
      where: { categoryId: id, active: true },
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
      ],
    });
  }
  async getProductModule(id: string) {
    return ProductModel.findAll({
      where: { moduleId: id, active: true },
      include: [
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
      ],
    });
  }
  async update(input: { id: string }, update: any) {
    return await ProductModel.update(update, { where: input, returning: true });
  }
  async delete(input: { id: string }) {
    await ProductModel.destroy({ where: input });
    return "product deleted";
  }

  async getVendorsProducts(id: string) {
    return await ProductModel.findAll({ where: { shopId: id, active: true } });
  }
  async getNewestArrival() {
    return await ProductModel.findAll({
      order: [["createdAt", "DESC"]],
      limit: 30,
    });
  }
  async switchProductVisibility(id: string, active: boolean) {
    await ProductModel.update({ active }, { where: { id } });
  }
  async getAnyProduct(id: string, shopId: string) {
    return await ProductModel.findOne({ where: { id, shopId } });
  }
}

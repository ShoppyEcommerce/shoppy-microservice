import {
  CategoryModel,
  ModuleModel,
  Product,
  ProductModel,
  ShopModel,
} from "../model";
import { Op } from "sequelize";

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
    console.log(input, update);

    return await ProductModel.update(update, { where: input, returning: true });
  }
  async delete(input: { id: string }) {
    await ProductModel.destroy({ where: input });
    return "product deleted";
  }

  async getVendorsProducts(id: string, categoryId:string) {
    const whereClause :any ={
      active: true,
      shopId: id,
    }
    if(categoryId){
      whereClause.categoryId =categoryId
    }
    return await ProductModel.findAll({ where: whereClause });
  }
  async getNewestArrival(shopId: string, count: number, categoryId?: string) {
    const whereClause: any = {
      active: true,
      shopId,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    return await ProductModel.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: Number(count) ?? 10,
    });
  }
  async switchProductVisibility(id: string, active: boolean) {
    await ProductModel.update({ active }, { where: { id } });
  }
  async getAnyProduct(input: Partial<Product>) {
    return await ProductModel.findOne({ where: input });
  }
  async getTopSeller(shopId: string, count: number, categoryId?: string) {
    const whereClause: any = {
      active: true,
      shopId,
      productSold: {
        [Op.gt]: 0,
      },
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    return await ProductModel.findAll({
      where: whereClause,
      order: [["productSold", "DESC"]],
      limit: Number(count) ?? 10,
    });
    // return await ShopModel.findAll({
    //   where:{
    //     numOfProductSold:{
    //       [Op.gt]:0
    //     }
    //   },
    //   order: [["numOfProductSold", "DESC"]],
    // })
  }
}

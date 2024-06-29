import {
  CategoryModel,
  LikeModel,
  ModuleModel,
  Product,
  ProductModel,
  RatingModel,
  ShopModel,
} from "../model";
import { Op } from "sequelize";
import { getPaginatedData } from "./pagination";

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
  async getProducts(query: any) {
    const { page = 1, limit = 16 } = query;

    return getPaginatedData(ProductModel, {
      page,
      limit,
      where: { active: true },
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
      order: [["itemName", "ASC"]],
    });
  }
  async searchProductWithCategoryId(categoryId: string, search: string) {
    const where = {
      categoryId,
      [Op.or]: [
        { itemName: { [Op.like]: `%${search}%` } },
        { Tag: { [Op.like]: `%${search}%` } },
      ],
    };

    return await ProductModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: LikeModel,
        },
        {
          model: RatingModel,
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

  async getVendorsProducts(id: string, categoryId: string) {
    const whereClause: any = {
      active: true,
      shopId: id,
    };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    return await ProductModel.findAll({ where: whereClause });
  }
  async getNewestArrival(shopId: string, count?: number, categoryId?: string) {
    const whereClause: any = {
      active: true,
      shopId,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    const queryOption: any = {
      where: whereClause,
      order: [["createdAt", "DESC"]],
    };
    if (count !== undefined && count > 0) {
      queryOption.limit = Number(count);
    }

    return await ProductModel.findAll(queryOption);
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

    const queryOptions: any = {
      where: whereClause,
      order: [["productSold", "DESC"]],
    };

    if (count !== undefined && count > 0) {
      queryOptions.limit = Number(count);
    }

    return await ProductModel.findAll(queryOptions);
    // const whereClause: any = {
    //   active: true,
    //   shopId,
    //   productSold: {
    //     [Op.gt]: 0,
    //   },
    // };

    // if (categoryId) {
    //   whereClause.categoryId = categoryId;

    // }
    // const queryOptions: any = {
    //   where: whereClause,
    //   order: [["productSold", "DESC"]],
    // };

    // if (count !== undefined && count > 0) {
    //   queryOptions.limit = Number(count);
    // }
    // return await ProductModel.findAll({
    //   where: whereClause,
    //   order: [["productSold", "DESC"]],
    //   limit: Number(count) ?? 10,
    // });
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

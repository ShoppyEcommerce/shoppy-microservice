import { option, ServiceValidation } from "./validation";
import {
  Service,
  ServiceRepository,
  CategoryRepository,
  CategoryModel,
  Category,
  ServiceModel,
} from "../../database";
import { ValidationError, BadRequestError } from "../../utils/ErrorHandler";
import { v4 as uuid } from "uuid";

export class ServiceService {
  private repository: ServiceRepository;
  private category: CategoryRepository;
  constructor() {
    this.repository = new ServiceRepository();
    this.category = new CategoryRepository();
  }
  async createService(service: Service, shopId: string) {
    const { error, value } = ServiceValidation.validate(service, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    const category = (await CategoryModel.findByPk(
      value.categoryId
    )) as unknown as Category;
    if (!category) {
      throw new BadRequestError("category not found", "");
    }

    const exist = await this.repository.findOne({
      categoryId: value.categoryId,
      shopId,
    });
    if (exist) {
      throw new BadRequestError(
        "you already have a service in this category",
        ""
      );
    }
    value.id = uuid();

    return await this.repository.create({ ...value, shopId });
  }

  async getService(id: string) {
    const service = (await this.repository.findOne({
      id,
    })) as unknown as Service;
    if (!service) {
      throw new BadRequestError("service not found", "");
    }
    return service;
  }

  async getAllService() {
    return await this.repository.findMany();
  }
  async searchService(search: string) {
    const service = await ServiceModel.findAll({
      where: {
        name: {
          contains: search,
        },
      },
    });
    return service;
  }
}

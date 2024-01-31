import { CategoryRepository } from "../database/Repository/category-repository";
import { ModuleModel } from "../database/model";
import { Category } from "../database/model/category";
import { Utils } from "../utils";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
import { ModuleService } from "./module-service";
import { CategorySchema, UpdateCategorySchema, option } from "./validation";
import { v4 as uuid } from "uuid";

export class CategoryService {
  private repository: CategoryRepository;
  constructor() {
    this.repository = new CategoryRepository();
  }

  async createCategory(input: Category) {
    const { error, value } = CategorySchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    value.name = Utils.Capitalizeword(value.name);

    const exist = await this.repository.Find({ name: value.name });
    if (exist) {
      throw new BadRequestError("This category already exist", "bad request");
    }
    const module = await ModuleModel.findByPk(value.moduleId);
    if (!module) {
      throw new BadRequestError("invalid module Id", "bad request");
    }
    value.id = uuid();
    const data = await this.repository.create(value);
    console.log(value);

    return Utils.FormatData(data);
  }
  async getCategory(id: string) {
    const data = await this.repository.Find({ id });
    if (!data) {
      throw new BadRequestError("Invalid category id", "Bad Request");
    }
    return Utils.FormatData(data);
  }
  async getCategories() {
    const category = await this.repository.getCategories();
    return Utils.FormatData(category);
  }
  async getCategoryModule(moduleId: string) {
    const category = await this.repository.getCategoryModule({ moduleId });
    return Utils.FormatData(category);
  }
  async updateCategory(id: string, input: any) {
    const { error, value } = UpdateCategorySchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "Validation Error");
    }
    const exist = await this.repository.Find({ id });
    if (!exist) {
      throw new BadRequestError("This category does not exist", "Not found");
    }
    if (value.moduleId) {
      let checkModule = await ModuleModel.findByPk(value.moduleId);
      if (!checkModule) {
        throw new BadRequestError(
          `The module with the id ${value.moduleId} does not exist`,
          "bad request"
        );
      }
    }
    if (value.name) {
      value.name = Utils.Capitalizeword(value.name);
    }

    const data = await this.repository.update({ id }, value);
    return Utils.FormatData(data);
  }
  async deleteCategory(id: string) {
    const exist = await this.repository.Find({ id });
    if (!exist) {
      throw new BadRequestError("This category does not exist", "Not found");
    }
    const data = await this.repository.delete({ id });
    return Utils.FormatData(data);
  }
}

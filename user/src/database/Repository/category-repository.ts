import { ModuleModel, Category, CategoryModel } from "../model";




export class CategoryRepository {

    async create(input:Category) {
        const category = await CategoryModel.create(input)
        return category
    }

    async Find(input:Record<string, string>){
        const category = await CategoryModel.findOne({where:input,  include: [ModuleModel]} )

        return category
    }
    async getCategories (){
        return CategoryModel.findAll({ include: [ModuleModel]})
    }
    async getCategoryModule(input:{moduleId:string}){
        return CategoryModel.findAll({where:input})
    }
    async update(input:{id:string}, update:any){
        await CategoryModel.update(update,{where:input})
        return "category updated"
    }
    async delete (input:{id:string}){
        await CategoryModel.destroy({where:input})
        return "category deleted"
    }
}
import { ServiceModel, Service, ShopModel,  CategoryModel } from "../model";

export class ServiceRepository {
  async create(input: Service) {
    return await ServiceModel.create(input);
  }
  async findOne(input:Partial<Service>){

    return await ServiceModel.findOne({where:input, include:[
        {
            model:ShopModel,
          


            
        },{
            model:CategoryModel,
            attributes:["id","name"]
        }
    ]})
  }
  async findMany(){
    return await ServiceModel.findAll({include:[
        {
            model:ShopModel,
          


            
        },{
            model:CategoryModel,
            attributes:["id","name"]
        }
    ]})

  }
  async update(input:Partial<Service>, id:string){
    return await ServiceModel.update(input, {where:{id}, returning:true})
  }
  async delete(id:string){
    return await ServiceModel.destroy({where:{id}})
  }
}

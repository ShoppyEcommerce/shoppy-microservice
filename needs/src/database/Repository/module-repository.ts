import { Module, ModuleModel } from "../model";




export class ModuleRepository {
    async createModule(input:Module) : Promise<Module> {
      console.log(input)
      const module =   await ModuleModel.create(input) as unknown as Module
      return module

    }
    async Find(input:Record<string, string>){
        
      return  ModuleModel.findOne({where:input})
   }
   async update(input:Record<string, string>, update:any){

    await ModuleModel.update(update, {
      where: input
    });
  
    return "module updated"

   }
   async getAllModules(){
  return ModuleModel.findAll()

   }
   async Delete(id:string){
      await ModuleModel.destroy({where:{id}})
      return "module deleted"
   }
}
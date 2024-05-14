import {Rider, RiderModel} from "../model"


export class RiderRepository {

    async create(input:Rider) :Promise<Rider>{
        return RiderModel.create(input) as unknown as Rider
    }
    async findRiderById (id:string){

        return RiderModel.findByPk(id)
    }
    async findOne(input:Partial<Rider>){
        return RiderModel.findOne({where:input})
    } 
    async update(update:Partial<Rider>, input:any){
        return RiderModel.update(update, {where:input, returning:true})
    }
    async findAll(input:Partial<Rider>){
        return RiderModel.findAll({where:input})
    }
    async deleteRider(id:string){
        return RiderModel.destroy({where:{id}})
    }
}
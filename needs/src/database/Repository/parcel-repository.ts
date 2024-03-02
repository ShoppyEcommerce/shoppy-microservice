import {ModuleModel, Parcel,ParcelModel} from "../model"



export class ParcelRepository {

    async create(input:Parcel){
        return await ParcelModel.create(input)
    }
    async find(input:Partial<Parcel>){
        return await ParcelModel.findOne({where:input, include:[{
            model:ModuleModel,
            attributes:["id","name","image"]
        }]})
    }
    async findMany(){
        return await ParcelModel.findAll({ include:[{
            model:ModuleModel,
            attributes:["id","name","image"]
        }]})
    }
    async update(input:Partial<Parcel>, update:any){
        return await ParcelModel.update(update, {where:input, returning:true})
    }
    async delete(input:Partial<Parcel>){
        return await ParcelModel.destroy({where:input})
    }
}



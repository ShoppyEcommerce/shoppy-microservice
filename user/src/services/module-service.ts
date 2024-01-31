
import { ModuleRepository } from "../database/Repository/module-repository";
import { Module } from "../database/model";
import { Utils } from "../utils";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
import { ModuleSchema, UpdateModuleSchema, option } from "./validation";
import { v4 as uuid } from "uuid";




export class ModuleService {

   private repository:ModuleRepository
    constructor(){
        this.repository = new ModuleRepository()
    }
async  createModule (input:Module){

    const {error} = ModuleSchema.validate(input, option)
    if(error){
        throw new ValidationError(error.details[0].message, "validation error")
    }
 input.name = Utils.Capitalizeword(input.name)
    const exist = await this.
    repository.Find({name:input.name})
    if(exist){
        throw new BadRequestError("This module already exist", "bad request")
    }
    const id = uuid()
    console.log(input)
   
    const data = await this.repository.createModule({...input, id })

    return Utils.FormatData(data)

}
async getModule (id:string){
    const data = await this.repository.Find({id})
    if(!data){
        throw new BadRequestError("invalid module id", "bad request")
    }

    return Utils.FormatData(data)
}

async getAllModule (){
    const data = await this.repository.getAllModules();
    return Utils.FormatData(data)
}

async updateModule (id:string, update:any, event:string){

    const {error} = UpdateModuleSchema.validate(update, option)
    if(error){
        throw new ValidationError(error.details[0].message,"Validation Error")
    }
    const module = await this.repository.Find({id})
    if(!module){
        throw new BadRequestError("This module does not exist","bad request")
    }
    if(update.name){
        update.name = Utils.Capitalizeword(update.name)
    }

    const data = await this.repository.update({id}, update)
        
        if(data){
             const payload = { 
                event: event,
                data
            };
            return Utils.FormatData(payload)
        }else{

            return Utils.FormatData({error:"something went wrong"})
        }

}
async delete(id:string){
    const exist = await this.repository.Find({id})
    if(!exist){
        throw new BadRequestError("module does not exist", "bad request")
    }
    const data = await this.repository.Delete(id)
    return Utils.FormatData(data)
}
async SubscribeEvents(payload:any){
 
    console.log('Triggering.... Vendor Events')

    payload = JSON.parse(payload)

    const { event, data } =  payload;
    console.log(event, data)

    // const { userId, product, order, qty } = data;

    // switch(event){
    //     case 'ADD_TO_WISHLIST':
    //     case 'REMOVE_FROM_WISHLIST':
    //         this.AddToWishlist(userId,product)
    //         break;
    //     case 'ADD_TO_CART':
    //         this.ManageCart(userId,product, qty, false);
    //         break;
    //     case 'REMOVE_FROM_CART':
    //         this.ManageCart(userId,product,qty, true);
    //         break;
    //     case 'CREATE_ORDER':
    //         this.ManageOrder(userId,order);
    //         break;
    //     default:
    //         break;
    // }

}

}
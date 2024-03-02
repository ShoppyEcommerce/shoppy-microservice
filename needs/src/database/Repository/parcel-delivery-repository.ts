import { ParcelDelivery, ParcelDeliveryModel } from "../model";


export class ParcelDeliveryRepository {
    async create(input:ParcelDelivery){
        return await ParcelDeliveryModel.create(input)
    }
}
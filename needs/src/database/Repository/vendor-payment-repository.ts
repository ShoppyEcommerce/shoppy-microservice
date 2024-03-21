import { Payment, VendorPaymentModel, VendorPayment } from "../model";

export class VendorPaymentRepository {
  async create(input: VendorPayment) {
    return VendorPaymentModel.create(input);
  }
  async find(input:Partial<VendorPayment>){
    return await VendorPaymentModel.findOne({
      where:input
    })
  }
  async findAll(input:any){

    return await VendorPaymentModel.findAll({
      where:input,
     
    })
  }
  async update(input:Partial<VendorPayment>, update:any){
    await VendorPaymentModel.update(update,{where:input})
  }
}

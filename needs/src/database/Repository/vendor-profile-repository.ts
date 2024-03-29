// import { VendorProfile, VendorProfileModel, VendorModel } from "../model";

// export class VendorProfileRepository {
//   async create(input: VendorProfile) {
//     return VendorProfileModel.create(input);
//   }
//   async findOne(input: Record<string, string>) {
//     return VendorProfileModel.findOne({ where: input, include: [{
//       model: VendorModel,
  
//       attributes:["id",
//     "firstName","lastName","email","phone"]

    
//     }] });
//   }
//   async findAll() {
//     return VendorProfileModel.findAll({ include: [{
//       model: VendorModel,
  
//       attributes:["id",
//     "firstName","lastName","email","phone"]

    
//     }] });
//   }
//   async update(input: { id: string }, update: any) {
//     return  await VendorProfileModel.update(update, { where: input, returning: true });
     
//   }
//   async delete(input: { id: string }) {
//     await VendorProfileModel.destroy({ where: input });
//     return "vendor deleted";
//   }
//   async getVendorProfile(id: string) {
//     return VendorProfileModel.findOne({ where: { vendorId: id } });
//   }
// }

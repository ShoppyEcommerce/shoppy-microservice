import { Vendor, VendorModel } from "../model";
import { VendorProfileModel } from "../model/vendor-profile";

export class VendorRepository {
  async createVendor(input: Vendor): Promise<Vendor> {
    const vendor = (await VendorModel.create(input)) as unknown as Vendor;
    return vendor;
  }
  async Find(input: Record<string, string | boolean>) {
    return await VendorModel.findOne({
      where: input,
      include: [VendorProfileModel],
    });
  }
  async findAll() {
    return await VendorModel.findAll({ attributes:["id","firstName","lastName","email","phone"], include: VendorProfileModel });
  }
  async findUnVerified(){
    return await VendorModel.findAll({where: {isVerified: false}, include: VendorProfileModel});
  }
  async getVendor(id: string) {
    return await VendorModel.findOne({ where: { id } });
  }
  async update(id: string, input: Partial<Vendor>) {
    return await VendorModel.update(input, { where: { id }, returning: true });
  }
  async delete(id: string) {
    await VendorModel.destroy({ where: { id } });
    return "Deleted Successfully";
  }
}

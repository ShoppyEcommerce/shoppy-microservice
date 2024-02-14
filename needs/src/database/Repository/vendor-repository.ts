import { Vendor, VendorModel } from "../model";
import { VendorProfileModel } from "../model/vendorProfile";

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
    return await VendorModel.findAll({ include: VendorProfileModel });
  }
  async getVendor(id: string) {
    return await VendorModel.findOne({ where: { id } });
  }
  async update(id: string, input: Partial<Vendor>) {
    return await VendorModel.update(input, { where: { id } });
  }
  async delete(id:string){
    await VendorModel.destroy({where:{id}})
    return 'Deleted Successfully'
  }
}

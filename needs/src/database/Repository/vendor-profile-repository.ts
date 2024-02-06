import { VendorModel } from "../model";
import { VendorProfile, VendorProfileModel } from "../model/vendorProfile";

export class VendorProfileRepository {
  async create(input: VendorProfile) {
    return VendorProfileModel.create(input);
  }
  async findOne(input: Record<string, string>) {
    return VendorProfileModel.findOne({ where: input, include: [VendorModel] });
  }
  async findAll() {
    return VendorProfileModel.findAll({ include: [VendorModel] });
  }
  async update(input: { id: string }, update: any) {
    await VendorProfileModel.update(update, { where: input });
    return "vendor updated";
  }
  async delete(input: { id: string }) {
    await VendorProfileModel.destroy({ where: input });
    return "vendor deleted";
  }
  async getVendorProfile(id: string) {
    return VendorProfileModel.findOne({ where: { vendorId: id } });
  }
}

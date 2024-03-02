import { SubVendor, SubVendorModel } from "../model";

export class SubVendorRepository {
  async create(input: SubVendor) {
    return await SubVendorModel.create(input);
  }
  async findOne(input: Partial<SubVendor>) {
    return await SubVendorModel.findOne({ where: input });
  }
}

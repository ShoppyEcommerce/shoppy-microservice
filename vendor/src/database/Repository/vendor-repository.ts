import { Vendor, VendorModel } from "../model";

export class VendorRepository {
  async createVendor(input: Vendor): Promise<Vendor> {
    const vendor = (await VendorModel.create(input)) as unknown as Vendor;
    return vendor;
  }
  async Find(input: Record<string, string>) {
    return await VendorModel.findOne({ where: input });
  }
  async getVendor(id: string) {
    return await VendorModel.findOne({ where: { id } });
  }
}

import { VendorOrder, VendorOrderModel } from "../model";

export class VendorOrderRepository {
  async create(input: VendorOrder) {
    return VendorOrderModel.create(input);
  }
  async getOrder(input: Record<string, string>) {
    return VendorOrderModel.findOne({ where: input });
  }
  async getOrders() {
    return VendorOrderModel.findAll();
  }
  async getMyOrders(input: Record<string, string>) {
    return VendorOrderModel.findAll({ where: input });
  }
  async update(input: Record<string, string>, update: any) {
    return VendorOrderModel.update(update, { where: input });
  }
}

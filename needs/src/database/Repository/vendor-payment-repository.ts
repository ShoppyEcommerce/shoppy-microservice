import { Payment, VendorPaymentModel } from "../model";

export class VendorPaymentRepository {
  async create(input: Payment) {
    return VendorPaymentModel.create(input);
  }
}

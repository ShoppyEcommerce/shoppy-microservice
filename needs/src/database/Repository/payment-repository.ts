import { Payment, PaymentModel } from "../model/payment";

export class PaymentRepository {
  async create(input: Payment) {
    return PaymentModel.create(input);
  }
}

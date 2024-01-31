import { Payment, PaymentModel } from "../model/payment";

export class PaymentRespository {
  async create(input: Payment) {
    return PaymentModel.create(input);
  }
}

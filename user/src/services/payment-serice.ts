import { PaymentRespository } from "../database/Repository/payment-repository";
import { Payment } from "../database/model/payment";

export class PaymentService {
  private repository: PaymentRespository;
  constructor() {
    this.repository = new PaymentRespository();
  }
  async createPayment(input: Payment) {
    return this.repository.create(input);
  }
}

import { PaymentRepository } from "../database/Repository";
import { Payment } from "../database/model/payment";

export class PaymentService {
  private repository: PaymentRepository;
  constructor() {
    this.repository = new PaymentRepository();
  }
  async createPayment(input: Payment) {
    return this.repository.create(input);
  }
}

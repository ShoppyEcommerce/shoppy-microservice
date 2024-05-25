import { RiderPayment, RiderPaymentRepository } from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { option, PaymentValidation } from "./validation";

export class RiderPaymentService {
  private repository: RiderPaymentRepository;
  constructor() {
    this.repository = new RiderPaymentRepository();
  }
  async createPayment(input: RiderPayment) {
    const { error } = PaymentValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    await this.repository.create(input);
  }
  async getPayment(input: Partial<RiderPayment>) {
    const payment = await this.repository.findOne(input);
    if (!payment) {
      throw new BadRequestError("payment not found", "");
    }
    return payment;
  }
  async getPayments(riderId: string) {
    return await this.repository.findAll({ riderId });
  }
  async getAllRiderPayment() {
    return await this.repository.findAll({});
  }
}

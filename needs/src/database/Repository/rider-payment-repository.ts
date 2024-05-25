import { RiderPaymentModel, RiderPayment } from "..";

export class RiderPaymentRepository {
  async create(input: RiderPayment) {
    return await RiderPaymentModel.create(input);
  }
  async findOne(input: Partial<RiderPayment>) {
    return await RiderPaymentModel.findOne({ where: input });
  }
  async findById(id: string) {
    return await RiderPaymentModel.findByPk(id);
  }
  async findAll(input: Partial<RiderPayment>) {
    return await RiderPaymentModel.findAll({ where: input });
  }
  async delete(input: Partial<RiderPayment>) {
    return await RiderPaymentModel.destroy({ where: input });
  }
}

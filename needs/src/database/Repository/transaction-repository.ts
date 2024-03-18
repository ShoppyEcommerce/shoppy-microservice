import { Transaction, TransactionHistoryModel, PaymentModel } from "../model";

export class TransactionRepository {
  async create(input: Transaction) {
    return TransactionHistoryModel.create(input);
  }
  async find(input: Partial<Transaction>): Promise<Transaction | null> {
    return await TransactionHistoryModel.findOne({
      where: input,
      include: {
        model: PaymentModel,
      },
    });
  }

  async findAll(input: Partial<Transaction>): Promise<Transaction[] | []> {
    return await TransactionHistoryModel.findAll({
      where: input,
      include: {
        model: PaymentModel,
      },
    });
  }
}

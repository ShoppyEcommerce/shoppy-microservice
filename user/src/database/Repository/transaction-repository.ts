import { Transaction, TransactionHistoryModel } from "../model/transaction";

export class TransactionRepository {
  async create(input: Transaction) {
    return TransactionHistoryModel.create(input);
  }
}

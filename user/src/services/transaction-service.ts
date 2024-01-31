import { TransactionRepository } from "../database/Repository/transaction-repository";
import { Transaction } from "../database/model/transaction";

export class TransactionService {
  private repository: TransactionRepository;
  constructor() {
    this.repository = new TransactionRepository();
  }
  async createTransaction(input: Transaction) {
    await this.repository.create(input);
  }
}

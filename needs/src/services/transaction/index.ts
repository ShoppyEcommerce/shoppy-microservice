import { Transaction,TransactionRepository } from "../../database";

export class TransactionService {
  private repository: TransactionRepository;
  constructor() {
    this.repository = new TransactionRepository();
  }
  async createTransaction(input: Transaction) {
    await this.repository.create(input);
  }
}

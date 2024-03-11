import {
  AdminWallet,
  AdminWalletModel,
  AdminWalletRepository,
} from "../../database";
import { v4 as uuid } from "uuid";

export class AdminWalletService {
  private adminWallet: AdminWalletRepository;

  constructor() {
    this.adminWallet = new AdminWalletRepository();
  }

  async createWallet() {
    const wallet = await this.adminWallet.findOne();

    if (!wallet) {
      const id = uuid();
      await this.adminWallet.create({ id, balance: 0, credit: 0, debit: 0 });
    }
  }

  async creditWallet(amount: number) {
    const wallet = (await this.adminWallet.findOne()) as unknown as AdminWallet;

    wallet.balance += amount;
    wallet.credit += amount;

    await AdminWalletModel.update(
      { balance: wallet.balance, credit: wallet.credit },
      { where: { id: wallet.id } }
    );
  }
}

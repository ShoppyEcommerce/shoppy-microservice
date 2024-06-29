import { AdminWalletModel, AdminWallet } from "../model";

export class AdminWalletRepository {
  async create(input: AdminWallet) {
    await AdminWalletModel.create(input);
  }
  async findOne() {
    return await AdminWalletModel.findOne();
  }

  async creditWallet(amount: number) {
    const wallet = (await this.findOne()) as unknown as AdminWallet;
 
    if (wallet) {
      const balance = wallet.balance + amount;
      const credit = wallet.credit + amount;
      await AdminWalletModel.update(
        { balance, credit },
        { where: { id: wallet.id } }
      );
    }
  }

  async debitWallet(amount: number) {
    const wallet = (await this.findOne()) as unknown as AdminWallet;
    if (wallet) {
      const balance = wallet.balance - amount;
      const debit = wallet.debit + amount;
      await AdminWalletModel.update(
        { balance, debit },
        { where: { id: wallet.id } }
      );
    }
  }
}

import { Wallet, WalletModel } from "../model/wallet";

export class WalletRepository {
  async create(input: { ownerId: string; id: string }) {
    const wallet = await WalletModel.create(input);

    return wallet;
  }
  async walletBalance(input: Record<string, string>) {
    return WalletModel.findOne({ where: input });
  }
  async update(ownerId: string, update: any) {
    await WalletModel.update(update, { where: { ownerId } });
  }
}

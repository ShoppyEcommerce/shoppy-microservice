import { ShopWallet, ShopWalletModel } from "../model";

export class ShopWalletRepository {
  async create(input: { shopId: string; id: string }) {
    const wallet = await ShopWalletModel.create(input);

    return wallet;
  }
  async getWallet(input: Partial<ShopWallet>) {
    return ShopWalletModel.findOne({ where: input });
  }
  async update(shopId: string, update: any) {
    return await ShopWalletModel.update(update, {
      where: { shopId },
      returning: true,
    });
  }
}

import { VendorWalletModel } from "../model";

export class VendorWalletRepository {
  async create(input: { ownerId: string; id: string }) {
    const wallet = await VendorWalletModel.create(input);

    return wallet;
  }
  async walletBalance(input: Record<string, string>) {
    return VendorWalletModel.findOne({ where: input });
  }
  async update(ownerId: string, update: any) {
    await VendorWalletModel.update(update, { where: { ownerId } });
  }
}

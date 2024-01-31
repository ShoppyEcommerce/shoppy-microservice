import { WalletRepository } from "../database/Repository/wallet-repository";
import { Wallet } from "../database/model/wallet";
import { Utils } from "../utils";
import { v4 as uuid } from "uuid";
import { BadRequestError } from "../utils/ErrorHandler";
import { PaymentRespository } from "../database/Repository/payment-repository";
import { Payment, PaymentStatus } from "../database/model/payment";

export class WalletService {
  private repository: WalletRepository;
  private payment: PaymentRespository;
  constructor() {
    this.repository = new WalletRepository();
    this.payment = new PaymentRespository();
  }
  async createWallet(ownerId: string) {
    const info = {
      ownerId,
      id: uuid(),
    };

    const wallet = await this.repository.create(info);

    return Utils.FormatData(wallet);
  }
  async getWalletBalance(userId: string) {
    const wallet = (await this.repository.walletBalance({
      ownerId: userId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    return wallet.balance;
  }
  async debitWallet(amount: number, userId: string) {
    const wallet = (await this.repository.walletBalance({
      ownerId: userId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    if (wallet?.balance === undefined || wallet.balance < amount) {
      throw new BadRequestError("Insufficient balance", "");
    }
    const update = {
      balance: wallet.balance - amount,
      debit: (wallet?.debit ?? 0) + amount,
    };
    await this.repository.update(userId, update);
    const payment = {
      id: uuid(),
      userId,
      amount,
      merchant: "wallet",
      status: PaymentStatus.SUCCESS,
      referenceId: wallet.id,
    };
    return this.payment.create(payment) as unknown as Payment;
  }
  async creditWallet(amount: number, userId: string) {
    const wallet = (await this.repository.walletBalance({
      ownerId: userId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const update = {
      balance: (wallet?.balance ?? 0) + amount,
      credit: (wallet?.credit ?? 0) + amount,
    };
    await this.repository.update(userId, update);
  }
}

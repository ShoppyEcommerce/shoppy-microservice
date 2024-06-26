import { Utils } from "../../utils";
import { v4 as uuid } from "uuid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  Payment,
  PaymentStatus,
  WalletRepository,
  PaymentRepository,
  TransactionRepository,
  Wallet,
  PaymentType,
  Type,
} from "../../database";
import { PaymentService } from "..";
import { TransactionType } from "../../database/model/transaction";
import { pinValidation, option, ChangePinValidation } from "./validation";

export class WalletService {
  private repository: WalletRepository;
  private payment: PaymentRepository;
  private Transaction: TransactionRepository;
  constructor() {
    this.repository = new WalletRepository();
    this.payment = new PaymentRepository();
    this.Transaction = new TransactionRepository();
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
    if (!wallet.pin) {
      throw new BadRequestError("please set wallet pin", "");
    }
    console.log(wallet, amount);

    if (wallet?.balance === undefined || wallet.balance < amount) {
      throw new BadRequestError("Insufficient balance", "");
    }
    const update = {
      balance: wallet.balance - amount,
      debit: (wallet?.debit ?? 0) + amount,
    };
    const updated = await this.repository.update(userId, update);
    return updated[1][0].dataValues;
  }
  async creditWallet(ref: string, userId: string) {
    const wallet = (await this.repository.walletBalance({
      ownerId: userId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    //verify referenceId
    const payment = new PaymentService();
    const res = await payment.verifyTransaction(ref);

    const update = {
      balance: (wallet?.balance ?? 0) + res.amount,
      credit: (wallet?.credit ?? 0) + res.amount,
    };
    const updated = await this.repository.update(userId, update);
    return { ...updated[1][0].dataValues, amount: res.amount };
  }
  async creditWithReferal(amount: number, userId: string) {
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
    const info = {
      id: uuid(),
      merchant: "wallet",
      amount: amount,
      userId,
      referenceId: wallet.id,
      status: PaymentStatus.SUCCESS,
      paymentType: PaymentType.USER_WALLET,
      type: Type.CREDIT,
    };

    const payment = new PaymentService();
    const pay = (await payment.createPayment(info)) as unknown as Payment;
    const payload = {
      id: uuid(),
      merchant: "wallet",
      amount: amount,
      userId,
      referenceId: await Utils.generatePaymentReference(userId),
      description: "Referal bonus",
      type: TransactionType.CREDIT_WALLET,
      paymentId: pay.id,
    };

    await this.Transaction.create(payload);
    // await payment.createPayment(payload);
    await this.repository.update(userId, update);
    return "wallet credited successfully";
  }

  async createPin(input: { pin: string }, ownerId: string) {
    const { error, value } = pinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    const wallet = await this.repository.walletBalance({ ownerId });
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    value.pin = await Utils.HashPassword(value.pin);

    await this.repository.update(ownerId, { pin: value.pin });
  }
  async changePin(input: { oldPin: string; newPin: string }, ownerId: string) {
    const { error } = ChangePinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const wallet = (await this.repository.walletBalance({
      ownerId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }

    const verifyPin = await Utils.ComparePassword(input.oldPin, wallet.pin!);
    if (!verifyPin) {
      throw new BadRequestError("incorrect  old pin", "");
    }
    const pin = await Utils.HashPassword(input.newPin);
    await this.repository.update(ownerId, { pin });
    return "pin changed";
  }
}

import { Utils } from "../../utils";
import { v4 as uuid } from "uuid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  Payment,
  PaymentStatus,
  PaymentRepository,
  TransactionRepository,
  Wallet,
  Type,
  PaymentType,
  ShopWalletRepository,
  ShopWallet,
  ShopPaymentRepository,
  ShopPayment,
} from "../../database";
import { PaymentService } from "..";
import { ChangePinValidation, option, pinValidation } from "./validation";

export class ShopWalletService {
  private repository: ShopWalletRepository;

  private payment: ShopPaymentRepository;
  private Transaction: TransactionRepository;
  constructor() {
    this.repository = new ShopWalletRepository();
    this.payment = new ShopPaymentRepository();
    this.Transaction = new TransactionRepository();
  }
  async createWallet(shopId: string) {
    const info = {
      shopId,
      id: uuid(),
    };

    const wallet = await this.repository.create(info);

    return Utils.FormatData(wallet);
  }
  async getWalletBalance(shopId: string) {
    const wallet = (await this.repository.getWallet({
      shopId,
    })) as unknown as ShopWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    return wallet.balance;
  }
  async debitWallet(amount: number, shopId: string) {
    const wallet = (await this.repository.getWallet({
      shopId,
    })) as unknown as ShopWallet;
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
    await this.repository.update(shopId, update);
    const payment = {
      id: uuid(),
      shopId,
      amount,
      merchant: "wallet",
      status: PaymentStatus.SUCCESS,
      referenceId: wallet.id,
      paymentType: PaymentType.USER_WALLET,
      type: Type.DEBIT,
    };
    (await this.payment.create(payment)) as unknown as ShopPayment;
    return wallet;
  }
  async creditWallet(ref: string, shopId: string) {
    const wallet = (await this.repository.getWallet({
      shopId,
    })) as unknown as ShopWallet;
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
    const updated = await this.repository.update(shopId, update);

    return { ...updated[1][0].dataValues, amount: res.amount };
  }

  async creditWithReferal(amount: number, shopId: string) {
    const wallet = (await this.repository.getWallet({
      shopId,
    })) as unknown as ShopWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const update = {
      balance: (wallet?.balance ?? 0) + amount,
      credit: (wallet?.credit ?? 0) + amount,
    };
    const payload = {
      id: uuid(),
      merchant: "wallet",
      amount: amount,
      shopId,
      referenceId: await Utils.generatePaymentReference(shopId),
      description: "Referal bonus",
      type: "credit",
    };

    //await this.Transaction.create(payload);
    // await payment.createPayment(payload);
    await this.repository.update(shopId, update);
    return "wallet credited successfully";
  }
  async createWalletPin(input: { pin: string }, shopId: string) {
    const { error, value } = pinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const wallet = await this.repository.getWallet({ shopId });
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    value.pin = Utils.HashPassword(value.pin);

    await this.repository.update(shopId, { pin: value.pin });
  }
  async changePin(input: { oldPin: string; newPin: string }, shopId: string) {
    const { error } = ChangePinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const wallet = (await this.repository.getWallet({
      shopId,
    })) as unknown as ShopWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }

    const verifyPin = await Utils.ComparePassword(input.oldPin, wallet.pin!);
    if (!verifyPin) {
      throw new BadRequestError("incorrect   pin", "");
    }
    const pin = await Utils.HashPassword(input.newPin);
    await this.repository.update(shopId, { pin });
    return "pin changed";
  }
}

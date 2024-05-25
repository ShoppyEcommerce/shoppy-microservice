import { Utils } from "../../utils";
import { v4 as uuid } from "uuid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  PaymentStatus,
  PaymentType,
  RiderPayment,
  RiderPaymentRepository,
  RiderPaymentStatus,
  RiderType,
  RiderWallet,
  RiderWalletRepository,
  Type,
} from "../../database";
import { PaymentService } from "..";
import { ChangePinValidation, option, pinValidation } from "./validation";
import { Wallet } from "../../api";

export class RiderWalletService {
  private repository = new RiderWalletRepository();
  private payment = new RiderPaymentRepository();
  async createWallet(riderId: string) {
    const info = {
      riderId,
      id: uuid(),
    };

    const wallet = await this.repository.create(info);

    return Utils.FormatData(wallet);
  }
  async getWalletBalance(riderId: string) {
    const wallet = (await this.repository.getWallet({
      riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    return wallet.balance;
  }
  async debitWallet(amount: number, riderId: string) {
    const wallet = (await this.repository.getWallet({
      riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    if (wallet?.balance === undefined || wallet?.balance < amount) {
      throw new BadRequestError("Insufficient balance", "");
    }
    const update = {
      balance: wallet.balance - amount,
      debit: (wallet?.debit ?? 0) + amount,
    };
    await this.repository.update(riderId, update);
    const payment = {
      id: uuid(),
      riderId,
      amount,
      merchant: "wallet",
      status: RiderPaymentStatus.SUCCESS,
      referenceId: wallet.id,
      paymentType: PaymentType.USER_WALLET,
      type: RiderType.DEBIT,
    };
    (await this.payment.create(payment)) as unknown as RiderPayment;
    return wallet;
  }
  async creditWallet(ref: string, riderId: string) {
    const wallet = (await this.repository.getWallet({
      riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const payment = new PaymentService();
    const res = await payment.verifyTransaction(ref);
    const update = {
      balance: (wallet?.balance ?? 0) + res.amount,
      credit: (wallet?.credit ?? 0) + res.amount,
    };
    const updated = await this.repository.update(riderId, update);
    return { ...updated[1][0].dataValues, amount: res.amount };
  }
  async creditWithReferal(amount: number, riderId: string) {
    const wallet = (await this.repository.getWallet({
      riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const update = {
      balance: (wallet?.balance ?? 0) + amount,
      credit: (wallet?.credit ?? 0) + amount,
    };
    await this.repository.update(riderId, update);
    return "wallet credited successfully";
  }

  async createWalletPin(input: Partial<RiderWallet>) {
    const { error, value } = pinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const wallet = (await this.repository.getWallet({
      riderId: value.riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    value.pin = Utils.HashPassword(value.pin);
    await this.repository.update(value.riderId, { pin: value.pin });
  }
  async changePin(input: { oldPin: string; newPin: string }, riderId: string) {
    const { error, value } = ChangePinValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const wallet = (await this.repository.getWallet({
      riderId,
    })) as unknown as RiderWallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const verifyPin = await Utils.ComparePassword(input.oldPin, wallet.pin!);
    if (!verifyPin) {
      throw new BadRequestError("incorrect pin", "");
    }
    const newPin = Utils.HashPassword(input.newPin);
    await this.repository.update(riderId, { pin: newPin });
    return "pin changed successfully";
  }
}

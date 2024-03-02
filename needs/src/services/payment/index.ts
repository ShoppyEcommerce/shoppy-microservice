import {
  PaymentRepository,
  Payment,
  PaymentStatus,
  WalletRepository,
  ProfileRepository,
  Profile,
  Wallet,
  WalletModel,
} from "../../database";
import {
  BadRequestError,
  PaymentRequiredError,
  ValidationError,
} from "../../utils/ErrorHandler";
import {
  PaymentValidation,
  InitializeValidation,
  option,
  CreateRecipientValidation,
} from "./validation";

import { PAYSTACK_API } from "../../config/constant";
import { v4 as uuid } from "uuid";
import { WalletService } from "../wallet";
import axios, { AxiosError } from "axios";
import { Message } from "../../database/model/message";

interface VerifyResponse {
  amount: number;
  status: PaymentStatus;
  currency: string;
  narration: string | null;
  date: Date;
  paymentType: string;
  customer: {
    email: string;
    phoneNumber: string | null;
  };
  message: string;
}

export class PaymentService {
  private repository: PaymentRepository;
  private profileRepo: ProfileRepository;
  private wallet: WalletRepository;
  constructor() {
    this.profileRepo = new ProfileRepository();
    this.repository = new PaymentRepository();
    this.wallet = new WalletRepository();
  }
  async createPayment(input: Payment) {
    const { error } = PaymentValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    return await this.repository.create(input);
  }
  async initializePaystackPayment(input: { email: string; amount: number }) {
    const { error } = InitializeValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const payload = {
      email: input.email,
      amount: input.amount * 100,
    };
    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  }
  async verifyTransaction(transferRef: string) {
    const res = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${transferRef}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    if (res.data.data.status !== "success")
      throw new PaymentRequiredError(
        `Transaction ${res.data.data.status}: ${res.data.message}`
      );

    const response: VerifyResponse = {
      message: res.data.message,
      amount: res.data.data.amount / 100,
      currency: res.data.data.currency,
      customer: {
        email: res.data.data.customer.email,
        phoneNumber: res.data.data.customer.phone,
      },
      date: res.data.data.paid_at,
      narration: res.data.data.message,
      paymentType: res.data.data.channel,
      status: res.data.data.status,
    };
    return response;
  }
  async getBank() {
    const bankList = await axios.get(`${PAYSTACK_API}/bank`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    console.log(bankList);
    return bankList.data.data;
  }
  async createRecipient(
    input: {
      name: string;
      account_number: string;
      bank_code: string;
      currency: string;
      type: string;
    },
    userId: string
  ) {
    const { error, value } = CreateRecipientValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    const recipient = await axios.post(
      `${PAYSTACK_API}/transferrecipient`,
      input,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const user = (await this.profileRepo.getProfile({
      userId,
    })) as unknown as Profile;
    console.log(user);
    user.recipient = recipient.data.data.recipient_code;
    await this.profileRepo.update(user.id, {
      recipient: recipient.data.data.recipient_code,
    });
    return "recipient saved successfully";
  }
  async transferToUser(amount: number, ownerId: string) {
    console.log(ownerId);
    const wallet = (await this.wallet.walletBalance({
      ownerId,
    })) as unknown as Wallet;
    if (!wallet) {
      throw new BadRequestError("wallet not found", "");
    }
    const user = (await this.profileRepo.getProfile({
      userId: ownerId,
    })) as unknown as Profile;

    if (!user.recipient) {
      throw new BadRequestError(
        "pls create a recipient with your bank details",
        ""
      );
    }

    const params = {
      source: "balance",
      reason: "pay out",
      amount: amount * 100,
      recipient: user.recipient,
    };
    const newWallet = await new WalletService().debitWallet(amount, ownerId);
    console.log(newWallet);
    try {
      const data = await axios.post(`${PAYSTACK_API}/transfer`, params, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
      return data.data;
    } catch (err) {
      setTimeout(async () => {
        const newWallet = (await this.wallet.walletBalance({
          ownerId,
        })) as unknown as Wallet;

        await WalletModel.update(
          {
            balance: (newWallet?.balance as number) + amount,
            debit: (newWallet.debit as number) - amount,
          },
          { where: { ownerId } }
        );
      }, 5000);
      const error = err as AxiosError;

      const newError = error?.response?.data as { message: string };
      throw new BadRequestError(
        newError.message ||
          "An error occurred during Paystack transfer pls try again",
        ""
      );
    }
  }
}

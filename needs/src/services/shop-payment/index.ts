import {
    PaymentRepository,
    Payment,
    PaymentStatus,
    WalletRepository,
    ProfileRepository,
    Profile,
 
    Wallet,
    WalletModel,
  
    ShopPaymentRepository,
    ShopPayment
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
    TransferValidation,
    verifyAccountValidation,
  } from "./validation";
  
  import { PAYSTACK_API } from "../../config/constant";
  
  import { WalletService } from "../wallet";
//   import { VendorWalletService } from "../vendor-wallet";
  import {ShopWalletService} from "../shop-wallet";

  import axios, { AxiosError } from "axios";
  
  import { Utils } from "../../utils";
  
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
  
  export class ShopPaymentService {
    private repository:  ShopPaymentRepository;

  
    constructor() {

      this.repository = new  ShopPaymentRepository();
 
    }
    async createPayment(input: ShopPayment) {
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
  ;
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
    //   const { error, value } = CreateRecipientValidation.validate(input, option);
    //   if (error) {
    //     throw new ValidationError(error.details[0].message, "");
    //   }
  
    //   const recipient = await axios.post(
    //     `${PAYSTACK_API}/transferrecipient`,
    //     input,
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //       },
    //     }
    //   );
    //   const user = (await this.profileRepo.findOne({
    //     vendorId:userId,
    //   })) as unknown as VendorProfile;
     
  
    //   user.recipient = recipient.data.data.recipient_code;
    //   await this.profileRepo.update(
    //     { id: user.id },
    //     {
    //       recipient: recipient.data.data.recipient_code,
    //       bankName: recipient.data.data.details.bank_name,
    //       accountNumber: recipient.data.data.details.account_number,
    //       accountName:recipient.data.data.details.account_name
          
    //     }
    //   );
      return "recipient saved successfully";
    }
    // async transferToUser(
    //   input: { amount: number; pin: string },
    //   ownerId: string
    // ) {
    //   const { error } = TransferValidation.validate(input, option);
    //   if (error) {
    //     throw new ValidationError(error.details[0].message, "");
    //   }
  
    //   const wallet = (await this.wallet.getWalletBalance(
    //     ownerId
    //   )) as unknown as Wallet;
    //   if (!wallet) {
    //     throw new BadRequestError("wallet not found", "");
    //   }
    //   if (!wallet.pin) {
    //     throw new BadRequestError(" pl create a pin to withdraw from wallet", "");
    //   }
    //   const user = (await this.profileRepo.findOne({
    //     userId: ownerId,
    //   })) as unknown as Profile;
  
    //   if (!user) {
    //     throw new BadRequestError("pls create a profile", "");
    //   }
    //   if (!user.recipient) {
    //     throw new BadRequestError(
    //       "pls create a recipient with your bank details",
    //       ""
    //     );
    //   }
    //   const verifyPin = await Utils.ComparePassword(input.pin, wallet.pin!);
  
     
  
    //   if (!verifyPin) {
    //     throw new BadRequestError("incorrect pin", "");
    //   }
  
    //   const params = {
    //     source: "balance",
    //     reason: "pay out",
    //     amount: input.amount * 100,
    //     recipient: user.recipient,
    //   };
    //   await new WalletService().debitWallet(input.amount, ownerId);
  
    //   try {
    //     const data = await axios.post(`${PAYSTACK_API}/transfer`, params, {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //       },
    //     });
    //     return data.data;
    //   } catch (err) {
    //     setTimeout(async () => {
    //       const newWallet = (await this.wallet.getWalletBalance(
    //         ownerId
    //       )) as unknown as Wallet;
  
    //       await VendorWalletModel.update(
    //         {
    //           balance: (newWallet?.balance as number) + input.amount,
    //           debit: (newWallet.debit as number) - input.amount,
    //         },
    //         { where: { ownerId } }
    //       );
    //     }, 5000);
    //     const error = err as AxiosError;
  
    //     const newError = error?.response?.data as { message: string };
    //     throw new BadRequestError(
    //       newError.message ||
    //         "An error occurred during Paystack transfer pls try again",
    //       ""
    //     );
    //   }
    // }
  
    async verifyAccount(input: { account_number: any; bank_code: any }) {
      const { error } = verifyAccountValidation.validate(input, option);
      if (error) {
        throw new ValidationError(error.details[0].message, "");
      }
      try {
        const response = await axios.get(
          `${PAYSTACK_API}/bank/resolve?account_number=${input.account_number}&bank_code=${input.bank_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        const err = error as AxiosError;
        const customErr = err?.response?.data as { message: string };
        throw new BadRequestError(customErr.message, "");
      }
    }
  }
  
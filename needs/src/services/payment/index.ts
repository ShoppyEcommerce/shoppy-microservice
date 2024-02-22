import { PaymentRepository, Payment, PaymentStatus } from "../../database";
import { PaymentRequiredError, ValidationError } from "../../utils/ErrorHandler";
import { PaymentValidation, InitializeValidation, option } from "./validation";
import axios from "axios"
import { PAYSTACK_API } from "../../config/constant";

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
  constructor() {
    this.repository = new PaymentRepository();
  }
  async createPayment(input: Payment) {
    const {error} =  PaymentValidation.validate(input, option);
    if(error){
        throw new ValidationError(error.details[0].message,"")
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
  async verifyTransaction(transferRef:string){
    const res = await axios.get(`${PAYSTACK_API}/transaction/verify/${transferRef}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
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
}

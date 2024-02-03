import { VendorRepository } from "../database";
import { Vendor, VendorModel } from "../database/model";
import { v4 as uuid } from "uuid";
import {
  registerVendorSchema,
  option,
  loginVendorSchema,
  VerifyOtpSchema,
} from "./validation";
import shortid from "shortid";
import { Utils } from "../utils";
import { ValidationError, BadRequestError } from "../utils/app-error";
import { sendSMS } from "../lib/sendSmS";

export class VendorService {
  private vendorRepository: VendorRepository;
  constructor() {
    this.vendorRepository = new VendorRepository();
  }
  async createVendor(input: Vendor): Promise<Vendor> {
    const { error, value } = registerVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.vendorRepository.Find({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.vendorRepository.Find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }

    value.id = uuid();
    value.password = await Utils.HashPassword(value.password);
    value.confirmPassword = await Utils.HashPassword(value.confirmPassword);
    const vendor = await this.vendorRepository.createVendor(value);
    return Utils.FormatData(vendor) as unknown as Vendor;
  }
  async Login(input: { phone: string }) {
    const { error, value } = loginVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = (await this.vendorRepository.Find({
      phone,
    })) as unknown as Vendor;
    if (!exist) {
      throw new BadRequestError("phone number does not exists", "Bad request");
    }
    const code = Utils.generateRandomNumber();
    const sms = await sendSMS(code.OTP, phone);
    console.log(sms);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }

    const token = await Utils.Encoded({ id: exist.id });
    await VendorModel.update(
      { OTP: code.OTP, OTPExpirationDate: code.timestamp },
      { where: { id: exist.id } }
    );

    //send a verification code to the user phone number

    return Utils.FormatData(token);
  }
  async VerifyOTP(input: { OTP: number; phone: string }, id: string) {
    const { error, value } = VerifyOtpSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;
    console.log(value, id);
    const phone = Utils.intertionalizePhoneNumber(value.phone);
    const vendor = (await this.vendorRepository.Find({
      OTP,
      id,
      phone,
    })) as unknown as Vendor;
    if (!vendor) {
      throw new BadRequestError("invalid Otp", "Bad Request");
    }

    if (Number(vendor.OTP) !== Number(OTP)) {
      throw new BadRequestError("Invalid OTP", "Bad Request");
    }
    const currentTimestamp = Date.now();
    const expirationTime = 5 * 60 * 1000;
    if (
      vendor &&
      currentTimestamp - Number(vendor.OTPExpirationDate) > expirationTime
    ) {
      throw new BadRequestError("OTP has expired", "Bad Request");
    }
    await VendorModel.update(
      { OTP: null, OTPExpirationDate: null },
      { where: { id } }
    );
    const data = {
      success: true,
      statusCode: 200,
    };
    return Utils.FormatData(data);
  }

  async SubscribeEvents(payload: any) {
    console.log("Triggering.... Customer Events");

    payload = JSON.parse(payload);

    const { event, data } = payload;
    console.log(event, data);

    // const { userId, product, order, qty } = data;

    // switch(event){
    //     case 'ADD_TO_WISHLIST':
    //     case 'REMOVE_FROM_WISHLIST':
    //         this.AddToWishlist(userId,product)
    //         break;
    //     case 'ADD_TO_CART':
    //         this.ManageCart(userId,product, qty, false);
    //         break;
    //     case 'REMOVE_FROM_CART':
    //         this.ManageCart(userId,product,qty, true);
    //         break;
    //     case 'CREATE_ORDER':
    //         this.ManageOrder(userId,order);
    //         break;
    //     default:
    //         break;
    // }
  }
}

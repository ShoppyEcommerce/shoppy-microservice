import { VendorRepository } from "../../database/Repository";
import { Vendor, VendorModel } from "../../database/model";
import { v4 as uuid } from "uuid";
import {
  registerVendorSchema,
  option,
  loginVendorSchema,
  VerifyOtpSchema,
} from "./validation";

import { Utils } from "../../utils";
import { ValidationError, BadRequestError } from "../../utils/ErrorHandler";
import { sendSMS } from "../../lib/sendSmS";

export class VendorService {
  private vendorRepository: VendorRepository;
  constructor() {
    this.vendorRepository = new VendorRepository();
  }
  async createVendor(input: Vendor) {
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
    const code = Utils.generateRandomNumber();
    const sms = await sendSMS(code.OTP, value.phone);
    console.log(sms);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }
    await VendorModel.update(
      { OTP: code.OTP, OTPExpirationDate: code.time },
      { where: { id: vendor.id } }
    );

    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }
  async Login(input: { phone: string; password: string }) {
    const { error, value } = loginVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }

    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = await this.vendorRepository.Find({
      phone,
    });
    if (!exist) {
      throw new BadRequestError("invalid credentials", "Bad request");
    }
    const vendor = await this.transformUser(exist.dataValues);
    if (!vendor.OTPVerification) {
      throw new BadRequestError("Account not verified", "Bad request");
    }
    const isValid = Utils.ComparePassword(value.password, vendor.password);
    if (!isValid) {
      throw new BadRequestError("invalid credentials", "Bad request");
    }

    const token = await Utils.Encoded({ id: vendor.id });

    //send a verification code to the user phone number

    return Utils.FormatData({
      token,
      ...vendor,
    });
  }
  async VerifyOTP(input: { OTP: number; phone: string }) {
    const { error, value } = VerifyOtpSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;

    const phone = Utils.intertionalizePhoneNumber(value.phone);
    const exist = await this.vendorRepository.Find({
      OTP,

      phone,
    });
    if (!exist) {
      throw new BadRequestError("invalid Otp", "Bad Request");
    }
    const vendor = await this.transformUser(exist.dataValues);

    if (Number(vendor.OTP) !== Number(OTP)) {
      throw new BadRequestError("Invalid OTP", "Bad Request");
    }
    if(vendor.OTPVerification){
      throw new BadRequestError("Account already verified", "Bad Request");
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
      { OTP: null, OTPExpirationDate: null, OTPVerification: true },
      { where: { id: vendor.id } }
    );

    const token = await Utils.Encoded({ id: vendor.id });
    const data = {
      token,
      ...vendor,
      OTP: null,
      OTPExpirationDate: null,
      OTPVerification: true,
    };
    return Utils.FormatData(data);
  }
  async resendOtp(input: string) {
    const phone = Utils.intertionalizePhoneNumber(input);
    const vendor = (await this.vendorRepository.Find({
      phone,
    })) as unknown as Vendor;
    if (!vendor) {
      throw new BadRequestError("vendor does not exist", "Bad Request");
    }
    const info = Utils.generateRandomNumber();
    const sms = await sendSMS(info.OTP, phone);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }
    await VendorModel.update(
      { OTP: info.OTP, OTPExpirationDate: info.time },
      { where: { id: vendor.id } }
    );
    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }
  async getVendor(id: string) {
    const vendor = await this.vendorRepository.getVendor(id);
    if (!vendor) {
      throw new BadRequestError("vendor does not exist", "Bad Request");
    }
    return Utils.FormatData(vendor);
  }
  async getVendors() {
    return await this.vendorRepository.findAll();
  }
  async deleteVendor(id: string) {
    const vendor = await this.vendorRepository.getVendor(id);
    if (!vendor) {
      throw new BadRequestError("vendor does not exist", "Bad Request");
    }
    const deleted = await this.vendorRepository.delete(id);
    return Utils.FormatData(deleted);
  }
  async transformUser(userData: any): Promise<Vendor> {
    const vendor: Vendor = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      role: userData.role,
      createdAt: new Date(userData.createdAt),
      OTP: userData.OTP,
      OTPExpirationDate: userData.OTPExpirationDate,
      isVerified: userData.isVerified,
      OTPVerification: userData.OTPVerification,
    };

    return vendor;
  }
}

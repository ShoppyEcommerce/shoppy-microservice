import {
  option,
  registerUserSchema,
  loginUserSchema,
  verifyOTPSchema,
} from "./validation";
import { UserRepository, VendorRepository } from "../../database";
import { User, UserModel, Vendor } from "../../database/model";
import { Utils } from "../../utils";
import shortid from "shortid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { sendSMS } from "../../lib/sendSmS";

export class UserService {
  private userRepository: UserRepository;
  private vendorRepository: VendorRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.vendorRepository = new VendorRepository();
  }

  async createUser(input: User, role: string) {
    const { error, value } = registerUserSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }

    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.userRepository.Find({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.userRepository.Find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }
    value.referralCode = shortid();
    value.role = role;
    value.password = await Utils.HashPassword(value.password);
    value.confirmPassword = await Utils.HashPassword(value.confirmPassword);

    const user = await this.userRepository.createUser(value);
    const info = Utils.generateRandomNumber();
    const sms = await sendSMS(info.OTP, value.phone);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }
    await UserModel.update(
      { OTP: info.OTP, OTPExpiration: info.time },
      { where: { id: user.id } }
    );

    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }
  async Login(input: { phone: string }) {
    const { error, value } = loginUserSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = await this.userRepository.Find({
      phone,
    });
    if (!exist) {
      throw new BadRequestError("phone number does not exists", "Bad request");
    }

    //send a verification code to the user phone number

    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }

  async VerifyOTP(input: { OTP: number; phone: string }) {
    const { error, value } = verifyOTPSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const user = (await this.userRepository.Find({
      OTP,
      phone,
    })) as unknown as User;
    if (!user) {
      throw new BadRequestError("user does not exist", "Bad Request");
    }

    if (Number(user.OTP) !== Number(OTP)) {
      throw new BadRequestError("Invalid OTP", "Bad Request");
    }

    const currentTimestamp = Date.now();
    const expirationTime = 5 * 60 * 1000;
    console.log(currentTimestamp - Number(user.OTPExpiration), expirationTime);
    if (
      user &&
      currentTimestamp - Number(user.OTPExpiration) > expirationTime
    ) {
      throw new BadRequestError("OTP has expired", "Bad Request");
    }

    await UserModel.update(
      { OTP: null, OTPExpiration: null, isverified: true },
      { where: { id: user.id } }
    );
    const token = await Utils.Encoded({ id: user.id });
    const data = {
      success: true,
      statusCode: 200,
      token,
    };
    return Utils.FormatData(data);
  }
  async resendOtp(phone: string) {
    const user = (await this.userRepository.Find({ phone })) as unknown as User;
    if (!user) {
      throw new BadRequestError("user does not exist", "Bad Request");
    }
    const info = Utils.generateRandomNumber();
    const sms = await sendSMS(info.OTP, phone);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }
    await UserModel.update(
      { OTP: info.OTP, OTPExpiration: info.time },
      { where: { id: user.id } }
    );
    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }
  async VerifyVendor(vendorId: string) {
    const vendor = (await this.vendorRepository.Find({
      id: vendorId,
    })) as unknown as Vendor;
    if (!vendor) {
      throw new BadRequestError("vendor not found", "");
    }
    if (vendor.isVerified) {
      throw new BadRequestError("vendor has already been verified", "");
    }
    await this.vendorRepository.update(vendorId, { isVerified: true });
    return Utils.FormatData("vendor has been verified");
  }
}

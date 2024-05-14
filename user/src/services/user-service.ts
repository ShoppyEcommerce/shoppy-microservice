import {
  option,
  registerUserSchema,
  loginUserSchema,
  verifyOTPSchema,
} from "./validation";
import { UserRepository } from "../database";
import { User, UserModel } from "../database/model";
import { Utils } from "../utils";
import shortid from "shortid";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
import { sendSMS } from "../lib/sendSmS";

export class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(input: User, role: string): Promise<User> {
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

    const vendor = await this.userRepository.createUser(value);
    return Utils.FormatData(vendor) as unknown as User;
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
    const info = Utils.generateRandomNumber();
    const sms = await sendSMS(info.OTP, phone);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }
    let { id } = exist as unknown as User;
    const token = await Utils.Encoded({ id });

    await UserModel.update(
      { OTP: info.OTP, OTPExpiration: info.time },
      { where: { id } }
    );

    //send a verification code to the user phone number

    return Utils.FormatData(token);
  }

  async VerifyOTP(input: { OTP: number; phone: string }, id: string) {
    const { error, value } = verifyOTPSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const user = (await this.userRepository.Find({
      OTP,
      id,
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
  
    if (
      user &&
      currentTimestamp - Number(user.OTPExpiration) > expirationTime
    ) {
      throw new BadRequestError("OTP has expired", "Bad Request");
    }
    await UserModel.update(
      { OTP: null, OTPExpiration: null },
      { where: { id } }
    );
    const data = {
      success: true,
      statusCode: 200,
    };
    return Utils.FormatData(data);
  }
}

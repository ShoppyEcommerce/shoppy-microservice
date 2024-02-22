import {
  option,
  registerUserSchema,
  loginUserSchema,
  verifyOTPSchema,
} from "./validation";
import {
  UserRepository,
  VendorRepository,
  WalletRepository,
} from "../../database";
import { User, UserModel, Vendor, WalletModel } from "../../database/model";
import { Utils } from "../../utils";
import shortid from "shortid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { sendSMS } from "../../lib/sendSmS";
import { WalletService } from "..";
interface Wallet {
  balance: number;
  id: string;
  ownerId: string;
}

export class UserService {
  private userRepository: UserRepository;
  private vendorRepository: VendorRepository;
  private wallet: WalletRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.vendorRepository = new VendorRepository();
    this.wallet = new WalletRepository();
  }

  async createUser(input: User, role: string) {
    const { error, value } = registerUserSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    let referalUser: Wallet = {
      balance: 0,
      id: "",
      ownerId: "",
    };
    if (value.referral) {
      const user = await UserModel.findOne({
        where: { referralCode: value.referral },
        include: [{ model: WalletModel, attributes: ["balance", "id"] }],
      });
      if (!user) {
        throw new BadRequestError(
          "No user with this referral code",
          "Bad Request"
        );
      }
      referalUser = await this.formatWalletModel(user);
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

    const userData = await this.userRepository.createUser(value);
    const user = await this.transformUser(userData.dataValues);

    const info = Utils.generateRandomNumber();
    const sms = await sendSMS(info.OTP, value.phone);
    if (sms && sms.status === 400) {
      throw new BadRequestError(sms.message, "");
    }

    const update = await UserModel.update(
      { OTP: info.OTP, OTPExpiration: info.time },
      { where: { id: user.id } }
    );

    const wallet = new WalletService();
    if (referalUser.ownerId) {
      await wallet.creditWithReferal(100, referalUser.ownerId);
    }

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
      throw new BadRequestError("invalid credentials", "Bad request");
    }
    const user = await this.transformUser(exist.dataValues);
    const valid = await Utils.ComparePassword(value.password, user.password);
    if (!valid) {
      throw new BadRequestError("invalid credentials", "Bad request");
    }

    //send a verification code to the user phone number

    const token = await Utils.Encoded({ id: user.id });
    return Utils.FormatData({
      ...user,
      token,
    });
  }

  async VerifyOTP(input: { OTP: number; phone: string }) {
    const { error, value } = verifyOTPSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const userData = await this.userRepository.Find({
      OTP,
      phone,
    });

    if (!userData) {
      throw new BadRequestError("user does not exist", "Bad Request");
    }
    const user = await this.transformUser(userData.dataValues);

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
      { OTP: null, OTPExpiration: null, isverified: true },
      { where: { id: user.id } }
    );
    const token = await Utils.Encoded({ id: user.id });
    const data = {
      token,
      ...user,
    };
    return Utils.FormatData(data);
  }
  async resendOtp(phone: string) {
    const exist = await this.userRepository.Find({ phone });
    if (!exist) {
      throw new BadRequestError("user does not exist", "Bad Request");
    }
    const user = await this.transformUser(exist.dataValues);
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
  async formatWalletModel(rawData: any): Promise<Wallet> {
    return {
      ownerId: rawData.id,
      balance: rawData.WalletModel.dataValues.balance,
      id: rawData.WalletModel.dataValues.id,
    };
  }
  async transformUser(userData: any): Promise<User> {
    const user: User = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      referralCode: userData.referralCode,
      role: userData.role,
      createdAt: new Date(userData.createdAt),

      OTP: userData.OTP,
      OTPExpiration: userData.OTPExpiration,
      isverified: userData.isverified,
    };

    return user;
  }
}

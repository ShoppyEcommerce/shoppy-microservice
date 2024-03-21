import {
  Vendor,
  VendorModel,
  VendorRepository,
  OrderRepository,
  Order,
  OrderStatus,
  VendorWalletRepository,
  Wallet,
  VendorPaymentRepository,
  PaymentType,
  Type,
  PaymentStatus,
} from "../../database";
import { v4 as uuid } from "uuid";
import {
  registerVendorSchema,
  option,
  loginVendorSchema,
  VerifyOtpSchema,
  ResetPasswordValidation,
  ChangePasswordValidation,
} from "./validation";

import { Utils } from "../../utils";
import { ValidationError, BadRequestError } from "../../utils/ErrorHandler";
import { sendSMS } from "../../lib/sendSmS";
import { VendorWalletService } from "..";
import { Op } from "sequelize";

export class VendorService {
  private vendorRepository: VendorRepository;
  private orderRepo: OrderRepository;
  private vendorWallet: VendorWalletRepository;
  private vendorPaymentRepo: VendorPaymentRepository;
  constructor() {
    this.vendorRepository = new VendorRepository();
    this.orderRepo = new OrderRepository();
    this.vendorWallet = new VendorWalletRepository();
    this.vendorPaymentRepo = new VendorPaymentRepository();
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
    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(code.OTP, value.phone);

      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }
    await VendorModel.update(
      { OTP: code.OTP, OTPExpirationDate: code.time },
      { where: { id: vendor.id } }
    );
    await new VendorWalletService().createWallet(value.id);

    return Utils.FormatData(
      `A 6 digit OTP has been sent to your phone number ${code.OTP}`
    );
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
    const isValid = await Utils.ComparePassword(
      value.password,
      vendor.password
    );
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
    if (vendor.OTPVerification) {
      await VendorModel.update(
        { OTP: null, OTPExpirationDate: null, OTPVerification: true },
        { where: { id: vendor.id } }
      );
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
    // const sms = await sendSMS(info.OTP, phone);
    // if (sms && sms.status === 400) {
    //   throw new BadRequestError(sms.message, "");
    // }
    await VendorModel.update(
      { OTP: info.OTP, OTPExpirationDate: info.time },
      { where: { id: vendor.id } }
    );
    return Utils.FormatData("A 6 digit OTP has been sent to your phone number");
  }
  async ResetOtpPasssword(input: { email: string }) {
    const user = await this.vendorRepository.Find({ email: input.email });
    if (!user) {
      throw new BadRequestError("user not found", "");
    }
    const exist = await this.transformUser(user.dataValues);
    const info = Utils.generateRandomNumber();
    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(info.OTP, exist.phone);
      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }
    await VendorModel.update(
      { OTP: info.OTP, OTPExpirationDate: info.time },
      { where: { id: exist.id } }
    );
    return Utils.FormatData(
      `A 6 digit OTP has been sent to your phone number ${info.OTP}`
    );
  }
  async ResetPassword(input: { email: string; OTP: number; password: string }) {
    const { error } = ResetPasswordValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    const user = await this.vendorRepository.Find({ email: input.email });
    if (!user) {
      throw new BadRequestError("user not found", "");
    }
    const exist = await this.transformUser(user.dataValues);
    if (Number(exist.OTP) !== Number(input.OTP)) {
      throw new BadRequestError("invalid Otp", "");
    }
    const currentTimestamp = Date.now();
    const expirationTime = 5 * 60 * 1000;
    if (
      user &&
      currentTimestamp - Number(exist.OTPExpirationDate) > expirationTime
    ) {
      throw new BadRequestError("OTP has expired", "Bad Request");
    }
    const hash = await Utils.HashPassword(input.password);
    await VendorModel.update(
      { OTP: null, OTPExpirationDate: null, password: hash },
      { where: { id: exist.id } }
    );
    return Utils.FormatData("password reset successfully");
  }
  async changePassword(
    input: {
      email: string;
      oldPassword: string;
      newPassword: string;
    },
    userId: string
  ) {
    const { error } = ChangePasswordValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const user = (await this.vendorRepository.Find({
      email: input.email,
      id: userId,
    })) as unknown as Vendor;
    if (!user) {
      throw new BadRequestError("vendor not found", "");
    }
    const compare = await Utils.ComparePassword(
      input.oldPassword,
      user.password
    );
    if (!compare) {
      throw new BadRequestError("invalid password", "");
    }
    const hash = await Utils.HashPassword(input.newPassword);

    await VendorModel.update({ password: hash }, { where: { id: user.id } });
    return "password changed successfully";
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
  async getUnVerified() {
    return await this.vendorRepository.findUnVerified();
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
  async VendorDashboard(userId: string) {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const vendorSales = await this.vendorPaymentRepo.findAll({
      userId,
      type: Type.CREDIT,
      status: PaymentStatus.SUCCESS,
    });
    const inProgressSales = await this.vendorPaymentRepo.findAll({
      userId,
      type: Type.CREDIT,
      status: PaymentStatus.PENDING,
    });
    const wallet = await this.vendorWallet.walletBalance({ ownerId: userId });
    const todayEarning = await this.vendorPaymentRepo.findAll({
      type: Type.CREDIT,
      status: PaymentStatus.SUCCESS,
      createdAt: {
        [Op.between]: [startOfToday, endOfToday],
      },
    });
    const orderCompleted = (await this.orderRepo.FindAll({
      vendorId: userId,
      orderStatus: OrderStatus.COMPLETED,
    })) as unknown as Order[];
    const orderPending = await this.orderRepo.FindAll({
      vendorId: userId,
      orderStatus: OrderStatus.PENDING,
    });
    const orderCancelled = await this.orderRepo.FindAll({
      vendorId: userId,
      orderStatus: OrderStatus.CANCELED,
    });
    const orderReturned = await this.orderRepo.FindAll({
      vendorId: userId,
      orderStatus: OrderStatus.RETURNED,
    });
    return {
      vendorSales,
      inProgressSales,
      wallet,
      todayEarning,
      orderCompleted,
      orderPending,
      orderCancelled,
      orderReturned,
    };
    // const wallet = (await this.vendorWallet.walletBalance({
    //   ownerId: vendorId,
    // })) as unknown as Wallet;

    // const cancel: Order[] = orders.filter(
    //   (order) => order.orderStatus === OrderStatus.CANCELED
    // );
    // const sales = orders.reduce((curr, acc) => curr + acc.totalAmount, 0);
    // const pending = orders.filter(
    //   (order) => order.orderStatus === OrderStatus.PENDING
    // );
    // const returned = orders.filter(
    //   (order) => order.orderStatus === OrderStatus.RETURNED
    // );
    // const progress = orders
    //   .filter((order) => order.orderStatus === OrderStatus.CONFIRMED)
    //   .reduce((cur, acc) => cur + acc.totalAmount, 0);
    // const cancelAmount = cancel.reduce((cur, acc) => cur + acc.totalAmount, 0);
  }
  async latestOrder(vendorId: string) {
    return await this.orderRepo.latestOrder({
      vendorId,
      orderStatus: OrderStatus.PENDING,
    });
  }
}

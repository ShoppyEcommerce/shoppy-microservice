import {
  Shop,
  ShopModel,
  ShopRepository,
  ShopPaymentRepository,
  OrderRepository,
  Order,
  OrderStatus,
  ShopWalletRepository,
  Wallet,
  PaymentType,
  Type,
  PaymentStatus,
} from "../../database";
import { v4 as uuid } from "uuid";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  option,
  registerShopValidation,
  loginShopValidation,
  VerifyOtpValidation,
  ShopDetailsValidation,
  ShopScheduleValidation,
  DeliverySettingValidation,
} from "./validation";
import { Utils } from "../../utils";
import { sendSMS } from "../../lib/sendSmS";
import { Op } from "sequelize";

interface ShopDetails {
  logo: string;
  storeName: string;
  contactNumber: string;
  Address: string;
  Banner: string;
  latitude: number;
  longitude: number;
  storeAdmin: {
    firstName: string;
    lastName: string;
  };
}
interface ShopSchedule {
  Monday?: any;
  Tuesday?: any;
  Wednesday?: any;
  Thursday?: any;
  Friday?: any;
  Saturday?: any;
  Sunday?: any;
}
interface ShopDeliverySettings {
  scheduleOrder?: boolean;
  Delivery?: boolean;
  TakeAway?: boolean;
  ApproximateDeliveryTime: string | undefined;
  MinimumProcessingTime: string | undefined;
}

export class ShopService {
  private repository: ShopRepository;
  private shopWalletRepo: ShopWalletRepository;
  private orderRepo: OrderRepository;
  private shopPaymentRepo: ShopPaymentRepository;
  constructor() {
    this.repository = new ShopRepository();
    this.shopWalletRepo = new ShopWalletRepository();
    this.orderRepo = new OrderRepository();
    this.shopPaymentRepo = new ShopPaymentRepository();
  }
  async register(input: Shop) {
    const { error, value } = registerShopValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    value.phoneNumber = Utils.intertionalizePhoneNumber(value.phoneNumber);

    const phone = await this.repository.find({
      phoneNumber: value.phoneNumber,
    });
    if (phone) {
      throw new BadRequestError("phone number already in use", "");
    }
    const email = await this.repository.find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }
    value.id = uuid();
    const code = Utils.generateVerification();
    const shop = await this.repository.createShop(value);

    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(code.OTP, value.phoneNumber);

      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }

    await this.repository.update(
      { verificationCode: code.OTP, verificationExpiration: code.time },
      shop.dataValues.id
    );
    const data = {
      message: `A 4 digit OTP has been sent to your phone number ${code.OTP}`,
      id: shop.dataValues.id,
    };
    return data;
  }
  async login(input: { phoneNumber: string }) {
    const { error } = loginShopValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    input.phoneNumber = Utils.intertionalizePhoneNumber(input.phoneNumber);
    const exist = await this.repository.find({
      phoneNumber: input.phoneNumber,
    });
    if (!exist) {
      throw new BadRequestError("phone number does not exist", "");
    }
    const code = Utils.generateVerification();
    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(code.OTP, input.phoneNumber);

      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }

    await this.repository.update(
      { verificationCode: code.OTP, verificationExpiration: code.time },
      exist.id
    );
    return Utils.FormatData(
      `A 4 digit OTP has been sent to your phone number ${code.OTP}`
    );
  }
  async updateShop(shopId: string, update: any) {
    await this.repository.update(
      { numOfProductSold: update.numOfProductSold },
      shopId
    );
  }

  async verifyOtp(input: { OTP: number; phoneNumber: string }) {
    const { error } = VerifyOtpValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }

    input.phoneNumber = Utils.intertionalizePhoneNumber(input.phoneNumber);

    const shop = await this.repository.find({ phoneNumber: input.phoneNumber });

    if (!shop) {
      throw new BadRequestError("user not found", "");
    }
    if (Number(shop.verificationCode) !== Number(input.OTP)) {
      throw new BadRequestError("invalid verification code", "");
    }
    const currentTimestamp = Date.now();
    const expirationTime = 5 * 60 * 1000;
    if (
      currentTimestamp - Number(shop.verificationExpiration) >
      expirationTime
    ) {
      throw new BadRequestError("verification code has expired", "");
    }
    const update = await this.repository.update(
      {
        verificationCode: null,
        verificationExpiration: null,
        verification: true,
      },
      shop.id
    );
    const transform = this.transformShop(update[1][0].dataValues);

    const token = await Utils.Encoded({ id: shop.id });
    return {
      ...transform,
      token,
    };
  }

  async updateShopDetails(input: ShopDetails, userId: string) {
    const { error } = ShopDetailsValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }

    const shop = await this.repository.getShop(userId);
    if (!shop) {
      throw new BadRequestError("shop not found", "");
    }

    const update = await this.repository.update({ shopDetails: input }, userId);
    return update[1][0].dataValues
  }
  async updateShopSchedule(input: ShopSchedule, userId: string) {
    const { error } = ShopScheduleValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }

    const shop = await this.repository.getShop(userId);
    if (!shop) {
      throw new BadRequestError("shop not found", "");
    }

    const update = await this.repository.update({ shopSchedule: input }, userId);
    return update[1][0].dataValues
  }
  async updateDeliverySetting(input: ShopDeliverySettings, userId: string) {
    const { error } = DeliverySettingValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }

    const shop = await this.repository.getShop(userId);
    if (!shop) {
      throw new BadRequestError("shop not found", "");
    }

   const update =  await this.repository.update({ DeliverySettings: input }, userId);
   return update[1][0].dataValues
  }
  async getUnVerifiedShops(): Promise<ShopModel[] | null> {
    return (await this.repository.getUnverifiedShop()) as unknown as ShopModel[];
  }
  async getVerifiedShops(): Promise<ShopModel[] | null> {
    return (await this.repository.getVerifiedShop()) as ShopModel[];
  }
  transformShop(input: Shop) {
    return {
      id: input.id,
      phoneNumber: input.phoneNumber,
      email: input.email,
      isVerified: input.isVerified,
      verificationCode: input.verificationCode,
      verificationExpiration: input.verificationExpiration,
      applicationReference: input.applicationReference,
      shopDetails: input.shopDetails,
      shopSchedule: input.shopSchedule,
      deliverySettings: input.DeliverySettings,
      verification: input.verification,
    };
  }
  async verifyShop(shopId: string) {
    const shop = await this.repository.getShop(shopId);
    if (!shop) {
      throw new BadRequestError("shop not found", "");
    }

    await this.repository.update({ isVerified: true }, shopId);
  }

  async TopSeller() {
    return await this.repository.getTopSeller();
  }
  async ShopDashboard(shopId: string) {
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
    const shopSales = await this.shopPaymentRepo.findAll({
      shopId,
      type: Type.CREDIT,
      status: PaymentStatus.SUCCESS,
    });
    const inProgressSales = await this.orderRepo.inProgessOrder(
      shopId,

   
    );
    const wallet = await this.shopWalletRepo.getWallet({ shopId });
    const todayEarning = await this.shopPaymentRepo.findAll({
      type: Type.CREDIT,
      status: PaymentStatus.SUCCESS,
      createdAt: {
        [Op.between]: [startOfToday, endOfToday],
      },
    });
    const orderCompleted = (await this.orderRepo.findAllShopOrder({
      shopId,
      orderStatus: OrderStatus.COMPLETED,
    })) as unknown as Order[];
    const orderPending = await this.orderRepo.findAllShopOrder({
      shopId,
      orderStatus: OrderStatus.PENDING,
    });
    const orderCancelled = await this.orderRepo.findAllShopOrder({
      shopId,
      orderStatus: OrderStatus.CANCELED,
    });
    const orderReturned = await this.orderRepo.findAllShopOrder({
      shopId,
      orderStatus: OrderStatus.RETURNED,
    });
    const latestOrder = await this.orderRepo.latestOrder({
      shopId,
    });
    return {
      shopSales,
      inProgressSales,
      wallet,
      todayEarning,
      orderCompleted,
      orderPending,
      orderCancelled,
      orderReturned,
      latestOrder,
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
}

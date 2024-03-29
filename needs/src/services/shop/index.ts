import { Shop, ShopModel, ShopRepository } from "../../database";
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

interface ShopDetails {
  logo: string;
  storeName: string;
  contactNumber: string;
  Address: string;
  Banner: string;
  latitude: number;
  longitude: number;
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
}

export class ShopService {
  private repository: ShopRepository;
  constructor() {
    this.repository = new ShopRepository();
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
      throw new BadRequestError("phone number already in user", "");
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
    return Utils.FormatData(
      `A 4 digit OTP has been sent to your phone number ${code.OTP}`
    );
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

    await this.repository.update({ shopDetails: input }, userId);
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

    await this.repository.update({ shopSchedule: input }, userId);
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

    await this.repository.update({ DeliverySettings: input }, userId);
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
  async verifyShop(shopId:string){
    const shop =  await this.repository.getShop(shopId);
    if(!shop){
      throw new BadRequestError("shop not found", "");
    }

    await this.repository.update({isVerified : true}, shopId); 

    
  }
}

import {
  Delivery,
  DeliveryModel,
  DeliveryProfileModel,
  DeliveryRepository,
} from "../../database";
import { v4 as uuid } from "uuid";
import {
  loginVendorSchema,
  option,
  registerVendorSchema,
  verifyOTPSchema,
} from "./validation";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { sendSMS } from "../../lib/sendSmS";

export class DeliveryService {
  private repository: DeliveryRepository;
  constructor() {
    this.repository = new DeliveryRepository();
  }

  async createDelivery(input: Delivery) {
    const { error, value } = registerVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.repository.Find({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.repository.Find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }

    value.id = uuid();
    const delivery = await this.repository.create(value);
    const info = Utils.generateRandomNumber();
    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(info.OTP, value.phone);
      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }
    await this.repository.update(
      { OTP: info.OTP, OTPExpiration: info.time },
      { id: delivery.id }
    );

    return `A verification code has been sent to your phone number ${info.OTP}`;
  }
  async Login(input: { phone: string; password: string }) {
    const { error, value } = loginVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = await this.repository.Find({
      phone,
    });
    if (!exist) {
      throw new BadRequestError("invalid credentials", "Bad request");
    }
    const valid = Utils.ComparePassword(
      input.password,
      exist.dataValues.password
    );
    if (!valid) {
      throw new BadRequestError("invalid credentials", "Bad request");
    }
    const token = await Utils.Encoded({ id: exist.dataValues.id });

    //send a verification code to the user phone number

    return Utils.FormatData({ token, ...exist.dataValues });
  }
  async VerifyOTP(input: { OTP: number; phone: string }) {
    const { error, value } = verifyOTPSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const { OTP } = value;
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const user = (await this.repository.Find({
      phone,
    })) as unknown as Delivery;
    if (!user) {
      throw new BadRequestError("user not found", "Bad Request");
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
    const update = await this.repository.update(
      { OTP: null, OTPExpiration: null, OTPVerification: true },
      { id: user.id }
    );

    const token = await Utils.Encoded({ id: user.id });
    const data = {
      token,
      ...update[1][0].dataValues,
    };
    return Utils.FormatData(data);
  }
  async verifyDeliveryMan(id: string) {
    const delivery = (await DeliveryModel.findByPk(id, {
      include: DeliveryProfileModel,
    })) as unknown as Delivery;
    if (!delivery) {
      throw new BadRequestError("delivery man does not exist", "Bad Request");
    }

    await this.repository.update({ isVerified: true }, id);
    return "delivery man verified successfully";
  }
  async getDeliveryMan(id: string) {
    const delivery = (await DeliveryModel.findByPk(id, {
      include: DeliveryProfileModel,
    })) as unknown as Delivery;
    if (!delivery) {
      throw new BadRequestError("delivery man does not exist", "Bad Request");
    }
    delete (delivery as any).password;
    return delivery;
  }
  async getDeliveriesMan() {
    const delivery = await DeliveryModel.findAll({
      where: {
        isVerified: true,
      },
    });
    console.log(delivery);
  }
  async getUnVerifiedDelivery() {
    return (await this.repository.findAll({
      isVerified: false,
    })) as unknown as Delivery[];
  }
}

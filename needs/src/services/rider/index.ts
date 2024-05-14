import { Rider, RiderModel, RiderRepository, RiderAvailability } from "../../database";
import { v4 as uuid } from "uuid";
import {
  loginRiderSchema,
  option,
  registerRiderSchema,
  verifyOTPSchema,
  updateDocumentetailValidation,
  updateLegalLicenseDetail,
  updatePersonalInformationValidation,
  updateVehicleDetailValidation,
} from "./validation";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";
import { sendSMS } from "../../lib/sendSmS";

export class RiderService {
  private repository: RiderRepository;
  constructor() {
    this.repository = new RiderRepository();
  }

  async create(input: Rider) {
    const { error, value } = registerRiderSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.phoneNumber = Utils.intertionalizePhoneNumber(value.phoneNumber);
    const phone = await this.repository.findOne({
      phoneNumber: value.phoneNumber,
    });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.repository.findOne({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }
    value.id = uuid();
    const rider = await this.repository.create(value);
    const info = Utils.generateVerification();
    const send = process.env.SEND_SMS === "true" ? true : false;
    if (send) {
      const sms = await sendSMS(info.OTP, value.phone);
      if (sms && sms.status === 400) {
        throw new BadRequestError(sms.message, "");
      }
    }
    await this.repository.update(
      { verificationCode: info.OTP, verificationExpiration: info.time },
      { id: rider.id }
    );
    return `A verification code has been sent to your phone number ${info.OTP}`;
  }

  async Login(input: { phoneNumber: string }) {
    const { error } = loginRiderSchema.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    input.phoneNumber = Utils.intertionalizePhoneNumber(input.phoneNumber);
    const exist = await this.repository.findOne({
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
      { id: exist.dataValues.id }
    );
    return Utils.FormatData(
      `A 4 digit OTP has been sent to your phone number ${code.OTP}`
    );
  }
  async verifyOtp(input: { OTP: number; phoneNumber: string }) {
    const { error } = verifyOTPSchema.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }

    input.phoneNumber = Utils.intertionalizePhoneNumber(input.phoneNumber);

    const rider = await this.repository.findOne({
      phoneNumber: input.phoneNumber,
    });

    if (!rider) {
      throw new BadRequestError("user not found", "");
    }
    if (Number(rider.dataValues.verificationCode) !== Number(input.OTP)) {
      throw new BadRequestError("invalid verification code", "");
    }
    const currentTimestamp = Date.now();
    const expirationTime = 5 * 60 * 1000;
    if (
      currentTimestamp - Number(rider.dataValues.verificationExpiration) >
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
      { id: rider.dataValues.id }
    );
    const transform = this.trasnformRider(update[1][0].dataValues);

    const token = await Utils.Encoded({ id: transform.id });
    return {
      ...transform,
      token,
    };
  }
  async updatePersonalInformation(input: Partial<Rider>, id: string) {
    const { error, value } = updatePersonalInformationValidation.validate(
      input,
      option
    );
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const update = await this.repository.update(
      {
        firstName: value.firstName,
        lastName: value.lastName,
        referalCode: value.referalCode,
      },
      { id }
    );

    return update[1][0].dataValues;
  }
  async updateLegalLicense(input: Partial<Rider>, id: string) {
    const { error, value } = updateLegalLicenseDetail.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const update = await this.repository.update(
      {
        legalLicenseDetail: {
          ...value,
        },
      },
      { id }
    );
    return update[1][0].dataValues;
  }
  async updateDocumentDetail(input: Partial<Rider>, id: string) {
    const { error, value } = updateDocumentetailValidation.validate(
      input,
      option
    );
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const update = await this.repository.update(
      {
        documentDetail: {
          ...value,
        },
      },
      { id }
    );
    return update[1][0].dataValues;
  }
  async updateVehicleDetail(input: Partial<Rider>, id: string) {
    const { error, value } = updateVehicleDetailValidation.validate(
      input,
      option
    );
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const update = await this.repository.update(
      {
        vehicleDetails: {
          ...value,
        },
      },
      { id }
    );
    return update[1][0].dataValues;
  }
  async goOnline(id:string){
    const rider =  await this.repository.findRiderById(id)

    if(!rider){
      throw new BadRequestError("rider not found","")
    }

    await this.repository.update({availability:RiderAvailability.Online},{id})

  }
  async goOffline(id:string){
    const rider =  await this.repository.findRiderById(id)

    if(!rider){
      throw new BadRequestError("rider not found","")
    }

    await this.repository.update({availability:RiderAvailability.Offline},{id})

  }
  trasnformRider(input: Rider) {
    return {
      id: input.id,
      phoneNumber: input.phoneNumber,
      email: input.email,
      isVerified: input.isVerified,
      verificationCode: input.verificationCode,
      verificationExpiration: input.verificationExpiration,
      verification: input.verification,
    };
  }
}

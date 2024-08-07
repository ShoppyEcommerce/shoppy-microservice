import {
  ProfileRepository,
  Profile,
  DeliveryAddressRepository,
  UserRepository,
} from "../../database";

import { Utils } from "../../utils";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { DeliveryAddressService } from "../delivery-address";
import {
  UpdateBankDetails,
  UpdateProfileSchema,
  option,
  profileSchema,
} from "./validation";
import { v4 as uuid } from "uuid";

export class ProfileService {
  private repository: ProfileRepository;
  private delivery: DeliveryAddressService;
  private userRepo: UserRepository;
  constructor() {
    this.repository = new ProfileRepository();
    this.delivery = new DeliveryAddressService();
    this.userRepo = new UserRepository();
  }
  async createProfile(input: Profile, user: string) {
    const { error, value } = profileSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.id = uuid();
    value.userId = user;

    const profile = await this.repository.create(value);
    return Utils.FormatData(profile);
  }
  async getProfile(userId: string) {
    const profile = await this.repository.getProfile({ userId });
    if (!profile) {
      throw new BadRequestError("Profile not found", "");
    }
    return Utils.FormatData(profile);
  }
  async updateProfile(userId: string, update: any) {
    const { error, value } = UpdateProfileSchema.validate(update, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const exist = (await this.repository.getProfile({
      userId,
    })) as unknown as Profile;
    if (!exist) {
      throw new BadRequestError("Profile not found", "");
    }
    if (value.firstName) {
      await this.updateFirstName(value.firstName, userId);
    }
    if (value.lastName) {
      await this.updateLastName(value.lastName, userId);
    }
    if (value.phoneNumber) {
      await this.updatePhoneNumber(value.phoneNumber, userId);
    }

    await this.repository.update({ id: exist.id }, value);
    return "profile updated successfully";
  }
  private async updateFirstName(name: string, userId: string) {
    await this.userRepo.update({ firstName: name }, userId);
  }
  private async updateLastName(name: string, userId: string) {
    await this.userRepo.update({ lastName: name }, userId);
  }
  private async updatePhoneNumber(phone: string, userId: string) {
    const number = Utils.intertionalizePhoneNumber(phone);

    const exist = await this.userRepo.Find({ phone: number });
    if (exist) {
      throw new BadRequestError("phone number already in use", "");
    }

    await this.userRepo.update({ phone: number }, userId);
  }
  async deleteProfile(userId: string) {
    const exist = (await this.repository.getProfile({
      userId,
    })) as unknown as Profile;
    if (!exist) {
      throw new BadRequestError("Profile not found", "");
    }
    const profile = await this.repository.delete({ id: exist.id });
    return Utils.FormatData(profile);
  }
  async updateBankDetails(input: Partial<Profile>, userId: string) {
    const { error } = UpdateBankDetails.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const profile = (await this.repository.getProfile({
      userId,
    })) as unknown as Profile;
    if (!profile) {
      throw new BadRequestError("profile not found", "");
    }
    const update = await this.repository.update({ id: profile.id }, input);

    return update[1][0].dataValues;
  }
  async addDeliveryAddress(address: string, userId: string) {
    const profile = (await this.repository.getProfile({
      userId,
    })) as unknown as Profile;
    if (!profile) {
      throw new BadRequestError("profile not found", "");
    }

    // Ensure deliveryAddress is initialized as an array or an empty array if undefined
    const deliveryAddress = profile.deliveryAddress ?? [];

    // Update deliveryAddress field
    const update = await this.repository.update(
      { id: profile.id },
      {
        deliveryAddress: [...deliveryAddress, address],
      }
    );
    return update[1][0].dataValues;
  }
  async removeDelivery(address: string, userId: string) {
    const profile = (await this.repository.getProfile({
      userId,
    })) as unknown as Profile;
    if (!profile) {
      throw new BadRequestError("profile not found", "");
    }

    const newAddress = profile.deliveryAddress?.filter(
      (prof) => prof.trim() !== address.trim()
    );
    const update = await this.repository.update(
      { id: profile.id },
      {
        deliveryAddress: newAddress,
      }
    );
    return update[1][0].dataValues;
  }
}

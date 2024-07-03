import { ProfileRepository, Profile } from "../../database";

import { Utils } from "../../utils";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  UpdateBankDetails,
  UpdateProfileSchema,
  option,
  profileSchema,
} from "./validation";
import { v4 as uuid } from "uuid";

export class ProfileService {
  private repository: ProfileRepository;
  constructor() {
    this.repository = new ProfileRepository();
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
    if (value.deliveryAddress) {
      const address: string[] = exist?.deliveryAddress ?? [];
      value.deliveryAddress = [...address, value.deliveryAddress];
    }

    const profile = await this.repository.update({ id: exist.id }, value);
    return Utils.FormatData(profile[1][0].dataValues);
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
    const update = await this.repository.update({id:profile.id}, input);

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
    const update = await this.repository.update({id:profile.id}, {
      deliveryAddress: [...deliveryAddress, address],
    });
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
    const update = await this.repository.update({id:profile.id}, {
      deliveryAddress: newAddress,
    });
    return update[1][0].dataValues;
  }
}

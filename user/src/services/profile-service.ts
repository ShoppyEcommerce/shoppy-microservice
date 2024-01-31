import { ProfileRepository } from "../database/Repository/profile-repository";
import { Profile } from "../database/model/profile";
import { Utils } from "../utils";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
import { UpdateProfileSchema, option, profileSchema } from "./validation";
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
  async updateProfile(id: string, update: any) {
    const { error, value } = UpdateProfileSchema.validate(update, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const exist = await this.repository.getProfile({ id });
    if (!exist) {
      throw new BadRequestError("Profile not found", "");
    }

    const profile = await this.repository.update(id, value);
    return Utils.FormatData(profile);
  }
  async deleteProfile(id: string) {
    const exist = await this.repository.getProfile({ id });
    if (!exist) {
      throw new BadRequestError("Profile not found", "");
    }
    const profile = await this.repository.delete({ id });
    return Utils.FormatData(profile);
  }
}

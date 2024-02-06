import { VendorProfile } from "../../database/model/vendorProfile";
import {
  VendorProfileRepository,
  VendorRepository,
} from "../../database/Repository";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { option, profileSchema } from "./validation";
import { v4 as uuid } from "uuid";

export class VendorProfileService {
  private repository: VendorProfileRepository;
  constructor() {
    this.repository = new VendorProfileRepository();
  }
  async createVendorProfile(input: VendorProfile, vendor: string) {
    const { error, value } = profileSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const profile = await this.repository.findOne({ vendorId: vendor });
    if (profile) {
      throw new BadRequestError("you already have a profile", "");
    }
    input.id = uuid();
    input.vendorId = vendor;
    console.log(input);

     return await this.repository.create(input);
  }
}

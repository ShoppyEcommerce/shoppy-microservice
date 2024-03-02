import { SubVendor, SubVendorRepository } from "../../database";
import { v4 as uuid } from "uuid";
import { option, subVendorValidation } from "./validation";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { Utils } from "../../utils";

export class SubVendorService {
  private repository: SubVendorRepository;

  constructor() {
    this.repository = new SubVendorRepository();
  }

  async create(input: SubVendor, vendorId:string) {
    const { error, value } = subVendorValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    value.id = uuid();
    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.repository.findOne({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "");
    }
    value.password = await Utils.HashPassword(value.password);
    value.vendorId =  vendorId

    const subVendor = await this.repository.create(value);
    return subVendor;
  }
}

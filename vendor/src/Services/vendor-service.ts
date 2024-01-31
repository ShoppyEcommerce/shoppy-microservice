import { VendorRepository } from "../database";
import { Vendor } from "../database/model";
import { v4 as uuid } from "uuid";
import { registerVendorSchema, option, loginVendorSchema } from "./validation";
import shortid from "shortid";
import { Utils } from "../utils";
import { ValidationError, BadRequestError } from "../utils/app-error";

export class VendorService {
  private vendorRepository: VendorRepository;
  constructor() {
    this.vendorRepository = new VendorRepository();
  }
  async createVendor(input: Vendor): Promise<Vendor> {
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
    const vendor = await this.vendorRepository.createVendor(value);
    return Utils.FormatData(vendor) as unknown as Vendor;
  }
  async Login(input: { phone: string }) {
    const { error, value } = loginVendorSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = (await this.vendorRepository.Find({
      phone,
    })) as unknown as Vendor;
    if (!exist) {
      throw new BadRequestError("phone number does not exists", "Bad request");
    }
    const token = await Utils.Encoded({ id: exist.id });

    //send a verification code to the user phone number

    return Utils.FormatData(token);
  }
  async SubscribeEvents(payload: any) {
    console.log("Triggering.... Customer Events");

    payload = JSON.parse(payload);

    const { event, data } = payload;
    console.log(event, data);

    // const { userId, product, order, qty } = data;

    // switch(event){
    //     case 'ADD_TO_WISHLIST':
    //     case 'REMOVE_FROM_WISHLIST':
    //         this.AddToWishlist(userId,product)
    //         break;
    //     case 'ADD_TO_CART':
    //         this.ManageCart(userId,product, qty, false);
    //         break;
    //     case 'REMOVE_FROM_CART':
    //         this.ManageCart(userId,product,qty, true);
    //         break;
    //     case 'CREATE_ORDER':
    //         this.ManageOrder(userId,order);
    //         break;
    //     default:
    //         break;
    // }
  }
}

import { option, registerUserSchema, loginUserSchema } from "./validation";
import { UserRepository } from "../database";
import { User } from "../database/model";
import { Utils } from "../utils";
import shortid from "shortid";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";

export class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(input: User, role: string): Promise<User> {
    const { error, value } = registerUserSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    value.phone = Utils.intertionalizePhoneNumber(value.phone);
    const phone = await this.userRepository.Find({ phone: value.phone });
    if (phone) {
      throw new BadRequestError("phone already in use", "Bad Request");
    }
    const email = await this.userRepository.Find({ email: value.email });
    if (email) {
      throw new BadRequestError("email already in use", "Bad Request");
    }
    value.referralCode = shortid();
    value.role = role;
    value.password = Utils.HashPassword(value.password);
    value.confirmPassword = Utils.HashPassword(value.confirmPassword);

    const vendor = await this.userRepository.createUser(value);
    return Utils.FormatData(vendor) as unknown as User;
  }
  async Login(input: { phone: string }) {
    const { error, value } = loginUserSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "validation error");
    }
    const phone = Utils.intertionalizePhoneNumber(value.phone);

    const exist = (await this.userRepository.Find({
      phone,
    })) as unknown as User;
    if (!exist) {
      throw new BadRequestError("phone number does not exists", "Bad request");
    }
    const token = await Utils.Encoded({ id: exist.id });
    console.log(token);

    //send a verification code to the user phone number

    return Utils.FormatData(token);
  }
}

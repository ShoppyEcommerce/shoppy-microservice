import {
  AdminPaymentModel,
  AdminPayment,
  UserModel,
  VendorModel,
  VendorProfileModel,
} from "../model";

export class AdminPaymentRepository {
  async create(input: AdminPayment) {
    await AdminPaymentModel.create(input);
  }
  async findOne(input: Partial<AdminPayment>) {
    return await AdminPaymentModel.findOne({
      where: input,
      include: [
        {
          model: UserModel,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
        {
          model: VendorModel,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
          include: [
            {
              model: VendorProfileModel,
              attributes: ["id", "location"],
            },
          ],
        },
      ],
    });
  }
  async findAll() {
    return await AdminPaymentModel.findAll({
      include: [
        {
          model: UserModel,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
        {
          model: VendorModel,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
          include: [
            {
              model: VendorProfileModel,
              attributes: ["id", "location"],
            },
          ],
        },
      ],
    });
  }
}

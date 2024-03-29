import {
  AdminPaymentModel,
  AdminPayment,
  UserModel,
  ShopModel,

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
          model: ShopModel,
       
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
          model: ShopModel,
        
        },
      ],
    });
  }
}

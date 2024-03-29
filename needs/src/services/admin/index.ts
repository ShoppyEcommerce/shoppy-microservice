import {
  DeliveryModel,
  OrderModel,
  UserModel,
  ShopModel,
} from "../../database";

export class AdminService {
  async getAllOrder(where: any) {
    return OrderModel.findAll({
      where,
      include: [
        {
          model: UserModel,
          as: "UserModel",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: ShopModel,
         
        },
        {
          model: DeliveryModel,
          as: "DeliveryModel",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });
  }
}

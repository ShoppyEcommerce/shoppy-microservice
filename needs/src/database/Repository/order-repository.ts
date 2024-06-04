import {
  CartModel,
  Order,
  OrderModel,
  OrderStatus,
  PaymentModel,
  RiderModel,
  ShopModel,
  TransactionHistoryModel,
  UserModel,
} from "../model";
import {Op} from "sequelize"

export class OrderRepository {
  async create(input: Order) {
    return OrderModel.create(input, {
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
        { model: ShopModel },

        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });
  }
  async Find(input: any) {
    return OrderModel.findOne({
      where: input,
      attributes: {
        exclude: ["trackingCode"],
      },
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
        {
          model: RiderModel,
          attributes: [
            "id",
            "email",
            "phoneNumber",
            "lastName",
            "firstName",
            "vehicleDetails",
          ],
        },
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });
  }
  async findTrackingCode(input: any) {
    return OrderModel.findOne({
      where: input,

      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
        {
          model: ShopModel,
          attributes: ["id", "phoneNumber", "email"],
        },
        {
          model: RiderModel,
          attributes: [
            "id",
            "email",
            "phoneNumber",
            "lastName",
            "firstName",
            "vehicleDetails",
          ],
        },
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });
  }
  async FindAll(input: Partial<Order>) {
    return OrderModel.findAll({
      where: input,
      attributes: {
        exclude: ["trackingCode"],
      },
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
        {
          model: ShopModel,
        },
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });
  }

  async findAllShopOrder(input:Partial<Order>){
    return OrderModel.findAll({
      where: input,
      attributes: {
        exclude: ["trackingCode"],
      },
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
      
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });

  }
  async updateOrder(input: Partial<Order>, id: string) {
    return OrderModel.update(input, {
      where: {
        id,
      },
      returning: true,
    });
  }
  async latestOrder(input: Partial<Order>) {
    return OrderModel.findOne({
      where: input,
      attributes: {
        exclude: ["trackingCode"],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
      
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });
  }
  async inProgessOrder(shopId:string){
    return OrderModel.findAll({
      where: {
        shopId:shopId,
        orderStatus: {
          [Op.notIn]: [
            OrderStatus.COMPLETED,
            OrderStatus.RETURNED,
            OrderStatus.CANCELED,
          ],
        },
      },
      attributes: {
        exclude: ["trackingCode"],
      },
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: CartModel,

          attributes: ["products", "totalAmount"],
        },
      
        {
          model: TransactionHistoryModel,
          include: [
            {
              model: PaymentModel,
            },
          ],
        },
      ],
    });

  }
}

import {
  CartModel,
  Order,
  OrderModel,
  OrderStatus,
  OrderTimelineModel,
  PaymentModel,
  RiderModel,
  ShopModel,
  TransactionHistoryModel,
  UserModel,
} from "../model";
import { getPaginatedData } from "./pagination";
import { Op } from "sequelize";

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
          model: OrderTimelineModel,
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

  async findAllShopOrder(input: Partial<Order>) {
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
          model: OrderTimelineModel,
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
  async inProgessOrder(shopId: string) {
    return OrderModel.findAll({
      where: {
        shopId: shopId,
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
  async shopOrderCount(start: Date, end: Date, shopId: string) {
    const order = await OrderModel.count({
      where: {
        shopId,
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });
    return order;
  }

  async shopOrderDetails(
    shopId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ) {
    const condition: any = {
      shopId,
    };
    if (status) {
      condition.orderStatus = status;
    }
    const searchConditions: any[] = [];
    if (search) {
      searchConditions.push(
        { "$User.firstName$": { [Op.iLike]: `%${search}%` } },
        { "$User.lastName$": { [Op.iLike]: `%${search}%` } },
        { "$User.email$": { [Op.iLike]: `%${search}%` } },
        { "$Rider.firstName$": { [Op.iLike]: `%${search}%` } },
        { "$Rider.lastName$": { [Op.iLike]: `%${search}%` } },
        { "$Rider.email$": { [Op.iLike]: `%${search}%` } },
        {
          "$Cart.products.itemName$": { [Op.contains]: [{ itemName: search }] },
        } // JSONB array search
      );
    }
    if (searchConditions.length > 0) {
      condition[Op.or] = searchConditions;
    }
    console.log(condition);
    return await getPaginatedData(OrderModel, {
      where: condition,
      page,
      limit,
      include: [
        {
          model: UserModel,
          attributes: ["firstName", "lastName", "email"],
        },
        {
          model: RiderModel,
          attributes: ["firstName", "lastName", "email"],
        },
        {
          model: CartModel,
          attributes: ["products"],
        },
      ],
    });
  }
}

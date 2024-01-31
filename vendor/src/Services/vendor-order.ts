import { v4 as uuid } from "uuid";
import { Utils } from "../utils";
import { VendorOrderRepository } from "../database/Repository/vendorOrder-repository";
import { BadRequestError, ValidationError } from "../utils/app-error";
import { updateOrderSchema } from "./validation";
import { VendorOrder } from "../database/model/vendorOrder";

export class VendorOrderService {
  private repository: VendorOrderRepository;
  constructor() {
    this.repository = new VendorOrderRepository();
  }
  async createOrder(input: any) {
    input.id = uuid();
    await this.repository.create(input);
    //send a message to the vendor that they have order
  }

  async getOrder(id: string) {
    const order = await this.repository.getOrder({ id });
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    return Utils.FormatData(order);
  }
  async getMyOrders(input: Record<string, string>) {
    return this.repository.getMyOrders(input);
  }
  async getOrders() {
    return this.repository.getOrders();
  }
  async updateOrder(id: string, update: any, event: string) {
    const { error, value } = updateOrderSchema.validate(update);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const order = (await this.repository.getOrder({
      id,
    })) as unknown as VendorOrder;
    if (!order) {
      throw new BadRequestError("Order not found", "");
    }
    await this.repository.update({ id }, update);
    const payload = {
      event: event,
      user: order.user.name,
    };
    return "Order updated";
  }
  async SubscribeEvents(payload: any) {
    payload = JSON.parse(payload);

    const { event, data } = payload;

    switch (event) {
      case "ORDER_PRODUCT":
        this.createOrder(data);
        break;

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
    }
  }
}

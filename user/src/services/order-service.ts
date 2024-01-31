import axios, { AxiosError } from "axios";
import { OrderRepository } from "../database/Repository/order-repository";
import { Order, UserModel } from "../database/model";
import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
import { OrderSchema, option } from "./validation";
import { Utils } from "../utils";
import { OrderStatus, PaymentType } from "../database/model/order";
import { WalletService } from "./wallet-service";
import { TransactionService } from "./transaction-service";
import { v4 as uuid } from "uuid";

export class OrderService {
  private repository: OrderRepository;
  private Wallet: WalletService;
  private transaction: TransactionService;
  constructor() {
    this.repository = new OrderRepository();
    this.Wallet = new WalletService();
    this.transaction = new TransactionService();
  }
  async createOrder(input: Order, user: string, event: string) {
    const { error } = OrderSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    //check if all product belongs to one vendor
    let order = {} as Order;
    const vendor = input.product.every(
      (item) => item.vendorId === input.vendorId
    );
    if (!vendor) {
      throw new ValidationError("All product must belong to one vendor", "");
    }
    //check if the price of each product is the actual price
    let productVendor = {} as { fullName: string; phone: string };
    const prod = input.product.map((item) =>
      axios.get(`http://localhost:8000/product/${item.id}`)
    );
    let amount: number = 0;
    try {
      const res = await axios.all(prod);
      console.log(res[0].data.data);
      productVendor = {
        fullName:
          res[0].data.data.VendorModel.firstName +
          " " +
          res[0].data.data.VendorModel.lastName,
        phone: res[0].data.data.VendorModel.phone,
      };

      res.forEach((response, index) => {
        const data = response.data.data;

        if (data.available.toLowerCase() !== "in stock") {
          throw new BadRequestError("Product is out of stock", "");
        }

        if (data.quantity < input.product[index].quantity) {
          throw new BadRequestError("Product quantity not sufficient", "");
        }

        const price = data.price * input.product[index].quantity;

        if (Number(price) !== Number(input.product[index].totalPrice)) {
          throw new BadRequestError(
            `Total price of ${input.product[index].name} is not correct with the quantity required`,
            ""
          );
        }

        amount += input.product[index].totalPrice;
      });

      if (amount !== input.totalAmount) {
        throw new BadRequestError("Total amount is not correct", "");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // Axios error with a response, extract the data
          const newError = axiosError.response.data;
          throw new BadRequestError(`${newError}`, "");
        }
      } else {
        const err = error as Error;
        console.log(err.message || err.name);

        throw new BadRequestError(err.message, "");
      }
    }

    if (input.paymentType === PaymentType.WALLET) {
      const wallet = await this.Wallet.debitWallet(amount, user);
      const transaction = {
        userId: user,
        amount: amount,
        type: "debit",
        referenceId: wallet.id,
        id: uuid(),
        description: `you made order from ${
          productVendor.fullName
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
        product: input.product,
      };
      order = {
        id: uuid(),
        referenceId: wallet.id,
        product: input.product,
        userId: user,
        store: productVendor.fullName,
        vendorId: input.vendorId,
        totalAmount: input.totalAmount,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
      };
      await this.transaction.createTransaction(transaction);
    } else if (input.paymentType === PaymentType.CREDIT_CARD) {
      //call payment service
    } else {
    }
    await this.repository.create(order);
    const customer = await UserModel.findOne({ where: { id: user } });

    const payload = {
      event: event,
      input,
      user: customer,
    };
    return Utils.FormatData(payload);
  }
  async SubscribeEvents(payload: any) {
    console.log("Triggering.... Vendor Events");

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

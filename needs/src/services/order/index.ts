import {
  Order,
  OrderRepository,
  CartRepository,
  CartStatus,
  Cart,
  ProductRepository,
  Product,
  Availability,
  PaymentType,
  VendorRepository,
  Vendor,
  Transaction,
  OrderStatus,
  VendorModel,
  Wallet,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { OrderValidationSchema, option } from "./validation";
import { WalletService, TransactionService } from "../";
import { v4 as uuid } from "uuid";
import { io } from "../../config/socket";

export class OrderService {
  private repository: OrderRepository;
  private wallet: WalletService;
  private transaction: TransactionService;
  private cart: CartRepository;
  private productRepo: ProductRepository;
  private vendorRepo: VendorRepository;
  constructor() {
    this.vendorRepo = new VendorRepository();
    this.repository = new OrderRepository();
    this.wallet = new WalletService();
    this.transaction = new TransactionService();
    this.cart = new CartRepository();
    this.productRepo = new ProductRepository();
  }
  async createOrder(input: Order, ownerId: string) {
    const { error, value } = OrderValidationSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const cart = await this.cart.getOpenCart({
      id: input.cartId,
      ownerId,
      status: CartStatus.OPEN,
    });

    if (!cart) {
      throw new BadRequestError("cart does not exist", "");
    }
    const newCart = this.mapCartModelToCart(cart);

    let newProduct: Product[] = [];
    let totalPrice: number = 0;
    const vendor = (await VendorModel.findByPk(
      input.vendorId
    )) as unknown as Vendor;

    if (!vendor) {
      throw new BadRequestError("vendor does not exist", "");
    }

    for (const cart of newCart.products) {
      const product = (await this.productRepo.getProduct({
        id: cart.id,
        ownerId: input.vendorId,
      })) as unknown as Product;
      if (!product) {
        throw new BadRequestError(
          "this product is not associated with this vendor",
          ""
        );
      }
      if (product.available === Availability.OUT_OF_STOCK) {
        throw new BadRequestError("this product is out of stock", "");
      }
      const price = cart.quantity * product.price;
      if (Number(price) !== cart.amount) {
        throw new BadRequestError(
          "this product amount and quantity do not match",
          `${cart.amount}, ${cart.quantity}`
        );
      }
      totalPrice += price;

      product.quantity = product.quantity - cart.quantity;
      newProduct.push(product);
    }
    if (totalPrice !== newCart.totalAmount) {
      throw new BadRequestError(
        `total amount expected ${totalPrice} total price gotten ${newCart.totalAmount}`,
        ""
      );
    }

    let transaction = {} as Transaction;
    let order = {} as Order;

    if (input.paymentType === PaymentType.WALLET) {
      const wallet = (await this.wallet.debitWallet(
        totalPrice,
        ownerId
      )) as unknown as Wallet;
      const newWallet = this.WalletModel(wallet);
      console.log(ownerId);
      transaction = {
        userId: ownerId,
        amount: totalPrice,
        type: "debit",
        referenceId: newWallet.id,
        id: uuid(),
        description: `you made order from ${vendor.firstName} ${
          vendor.lastName
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
        product: newCart.products,
      };
      order = {
        id: uuid(),
        referenceId: newWallet.id,
        cartId: input.cartId,
        userId: ownerId,
        vendorId: input.vendorId,
        totalAmount: totalPrice,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
      };
    }
    const updates = newProduct.map(
      async (product) =>
        await this.productRepo.update({ id: product.id }, product)
    );

    // Wait for all update operations to complete
    await Promise.all(updates);

    await this.transaction.createTransaction(transaction);
    await this.repository.create(order);
    await this.cart.updateCart(
      { status: CartStatus.CLOSED },
      { id: input.cartId, ownerId }
    );
    io.emit("newOrder", { order, vendor: input.vendorId });
    return "order was successful";
  }
  private mapCartModelToCart = (cartModel: any): Cart => {
    return {
      id: cartModel.dataValues.id,
      products: cartModel.dataValues.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        amount: product.amount,
      })),
      vendor: cartModel.dataValues.vendor,
      totalAmount: cartModel.dataValues.totalAmount,
      status: cartModel.dataValues.status as CartStatus, // Assuming status is of type CartStatus
      ownerId: cartModel.dataValues.ownerId,
    };
  };
  private WalletModel = (wallet: any) => {
    return {
      id: wallet.dataValues.id,
    };
  };
}

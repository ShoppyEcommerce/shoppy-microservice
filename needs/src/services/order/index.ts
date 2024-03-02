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
  TransactionType,
  OrderStatus,
  VendorModel,
  Wallet,
  DeliveryModel,
  DeliveryProfileModel,
  DeliveryProfile,
  DeliveryProfileRepository,
  VendorProfile,
  Delivery,
  PaymentRepository,
  PaymentStatus,
  Type,
  Payment,
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  InitializeValidation,
  OrderValidationSchema,
  option,
  OrderValidation,
} from "./validation";
import { Op } from "sequelize";
import { WalletService, TransactionService } from "../";
import { v4 as uuid } from "uuid";
import { io } from "../../config/socket";
import { Utils } from "../../utils";
import { PaymentService } from "../";
import axios from "axios";
import { PAYSTACK_API } from "../../config/constant";
import * as geolib from "geolib";
import { VendorProfileModel } from "../../database/model/vendor-profile";

export class OrderService {
  private repository: OrderRepository;
  private wallet: WalletService;
  private transaction: TransactionService;
  private cart: CartRepository;
  private productRepo: ProductRepository;
  private vendorRepo: VendorRepository;
  private deliveryProfile: DeliveryProfileRepository;
  private payment: PaymentRepository;
  constructor() {
    this.vendorRepo = new VendorRepository();
    this.repository = new OrderRepository();
    this.wallet = new WalletService();
    this.transaction = new TransactionService();
    this.cart = new CartRepository();
    this.productRepo = new ProductRepository();
    this.deliveryProfile = new DeliveryProfileRepository();
    this.payment = new PaymentRepository();
  }
  async createOrder(input: Order, ownerId: string) {
    // Validate order input
    const { error, value } = OrderValidationSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    // // Check if cart exists
    const cart = await this.cart.getOpenCart({
      id: input.cartId,
      ownerId,
      status: CartStatus.OPEN,
    });
    if (!cart) {
      throw new BadRequestError("Cart does not exist", "");
    }

    // // Fetch vendor details
    const vendor = (await VendorModel.findByPk(
      input.vendorId
    )) as unknown as Vendor;
    if (!vendor) {
      throw new BadRequestError("Vendor does not exist", "");
    }

    // // Initialize variables
    let totalPrice: number = 0;
    let newProduct: Product[] = [];
    let transaction: Transaction = {} as Transaction;
    let payment: Payment = {} as Payment;
    let order: Order = {} as Order;
    const newCart: Cart = this.mapCartModelToCart(cart);


    // // Process products in the cart
    for (const cartItem of newCart.products) {
      const product = (await this.productRepo.getProduct({
        id: cartItem.id,
        ownerId: input.vendorId,
      })) as unknown as Product;

  

      if (!product) {
        throw new BadRequestError(
          "This product is not associated with this vendor",
          ""
        );
      }
      const FormatData = this.formatProduct(product);
     

      const price = cartItem.Qty * FormatData.price;
      if (price !== cartItem.amount) {
        throw new BadRequestError(
          "Product amount and quantity do not match",
          `${cartItem.amount}, ${cartItem.Qty}`
        );
      }
      totalPrice += price;

      FormatData.totalStock -= cartItem.Qty;
      if (FormatData.totalStock === 0) {
        FormatData.available = Availability.OUT_OF_STOCK;
      }
      newProduct.push(FormatData);
    }

    // Validate total price
    if (totalPrice !== newCart.totalAmount) {
      throw new BadRequestError(
        `Total amount expected ${totalPrice} but total price gotten ${newCart.totalAmount}`,
        ""
      );
    }

    // Perform payment
    if (input.paymentType === PaymentType.USER_WALLET) {
      const wallet = await this.processWalletPayment(totalPrice, ownerId);
      console.log(wallet);

      payment = {
        id: uuid(),
        status: PaymentStatus.SUCCESS,
        merchant: "wallet",
        amount: totalPrice,
        userId: ownerId,
        referenceId: wallet.id,
        paymentType: PaymentType.USER_WALLET,
        type: Type.DEBIT,
      };

      transaction = {
        userId: ownerId,
        amount: totalPrice,
        type: TransactionType.PURCHASE,
        referenceId: wallet.id,
        id: uuid(),
        paymentId: "",
        description: `you made order from ${vendor.firstName} ${
          vendor.lastName
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
      };
      order = {
        id: uuid(),
        referenceId: wallet.id,
        cartId: input.cartId,
        userId: ownerId,
        vendorId: input.vendorId,
        totalAmount: totalPrice,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
        transactionId: "",
      };
    }
    //else if (input.paymentType === PaymentType.BANK_TRANSFER) {
    //   const res = await this.processPaystackPayment(
    //     input.referenceId!,
    //     totalPrice,
    //     ownerId
    //   );
    //   payment = {
    //     id: uuid(),
    //     status: PaymentStatus.SUCCESS,
    //     merchant: "paystack",
    //     amount: totalPrice,
    //     userId: ownerId,
    //     referenceId: input.referenceId,
    //     paymentType: PaymentType.BANK_TRANSFER,
    //     type: Type.DEBIT,
    //   };
    //   transaction = {
    //     userId: ownerId,
    //     amount: totalPrice,
    //     type: TransactionType.PURCHASE,
    //     referenceId: input.referenceId,
    //     paymentId: "",
    //     id: uuid(),
    //     description: `you made order from ${vendor.firstName} ${
    //       vendor.lastName
    //     } store  on ${new Date().toLocaleDateString("en-GB")}.`,
    //   };
    //   order = {
    //     id: uuid(),
    //     referenceId: input.referenceId,
    //     cartId: input.cartId,
    //     userId: ownerId,
    //     vendorId: input.vendorId,
    //     totalAmount: totalPrice,
    //     paymentType: input.paymentType,
    //     orderStatus: OrderStatus.PENDING,
    //     transactionId: "",
    //   };
    // } else if (input.paymentType === PaymentType.CASH_ON_DELIVERY) {
    //   payment = {
    //     id: uuid(),
    //     status: PaymentStatus.PENDING,
    //     merchant: "paystack",
    //     amount: totalPrice,
    //     userId: ownerId,
    //     referenceId: input.referenceId,
    //     paymentType: PaymentType.CASH_ON_DELIVERY,
    //     type: Type.DEBIT,
    //   };
    //   transaction = {
    //     userId: ownerId,
    //     amount: totalPrice,
    //     type: TransactionType.PURCHASE,
    //     referenceId: ownerId,
    //     id: uuid(),
    //     description: `you made order from ${vendor.firstName} ${
    //       vendor.lastName
    //     } store  on ${new Date().toLocaleDateString("en-GB")}.`,
    //     paymentId: "",
    //   };
    //   order = {
    //     id: uuid(),
    //     referenceId: ownerId,
    //     cartId: input.cartId,
    //     userId: ownerId,
    //     vendorId: input.vendorId,
    //     totalAmount: totalPrice,
    //     paymentType: input.paymentType,
    //     orderStatus: OrderStatus.PENDING,
    //     transactionId: "",
    //   };
    // } else {
    //   throw new BadRequestError("invalid payment type", "");
    // }

    
    // // Update product quantities
    await Promise.all(
      newProduct.map((product) => this.updateProductQuantity(product))
      );
      console.log(transaction, order, payment)

    const payed = (await this.payment.create(payment)) as unknown as Payment;
    console.log(payed)

    transaction.paymentId = payed.id;
    // Create transaction
    const transact = (await this.transaction.createTransaction(
      transaction
    )) as unknown as Transaction;
    console.log(transact)
    order.transactionId = transact.id;

    // // Create order
    await this.repository.create(order);

    // // Update cart status
    await this.cart.updateCart(
      { status: CartStatus.CLOSED },
      { id: input.cartId, ownerId }
    );

    // // Emit event for new order
    io.emit("newOrder", { order, vendor: input.vendorId });

    return "Order was successful";
  }

  private async processWalletPayment(totalPrice: number, ownerId: string) {
;
    const wallet = (await this.wallet.debitWallet(
      totalPrice,
      ownerId
    )) as Wallet;
  
    return wallet
    // Process wallet payment and create transaction
  }

  private async processPaystackPayment(
    referenceId: string,
    totalPrice: number,
    ownerId: string
  ) {
    const payment = new PaymentService();
    const res = await payment.verifyTransaction(referenceId);

    if (res.status === "success") {
      if (res.amount !== totalPrice) {
        throw new BadRequestError(
          `invalid total price expected ${totalPrice} but got ${res.amount}`,
          ""
        );
      }
      return res;
    } else {
      throw new BadRequestError("Invalid transaction", "");
    }
    // Process Paystack payment and verify transaction
  }

  private async updateProductQuantity(product: Product) {
    return this.productRepo.update(
      { id: product.id },
      {
        totalStock: product.totalStock,
        available:
          product.totalStock === 0
            ? Availability.OUT_OF_STOCK
            : Availability.IN_STOCK,
      }
    );
  }

  private mapCartModelToCart = (cartModel: any): Cart => {
    return {
      id: cartModel.dataValues.id,
      products: cartModel.dataValues.products.map((product: any) => ({
        id: product.id,
        itemName: product.itemName,
        Qty: product.Qty,
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
  async getAllMyOrder(id: string, vendorId: string) {
    const order = await this.repository.Find({ id, vendorId });
    if (!order) {
      throw new BadRequestError("no order found", "");
    }

    return Utils.FormatData(order);
  }
  async getUserOrder(userId: string) {
    const order = await this.repository.FindAll({ userId });
    return order;
  }
  async getAllMyOrders(vendorId: string) {
    return await this.repository.FindAll({ vendorId });
  }
  async initializePaystackPayment(input: { email: string; amount: number }) {
    const { error } = InitializeValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const payload = {
      email: input.email,
      amount: input.amount * 100,
    };
    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  }
  async processOrder(vendorId: string, id: string) {
    const order = (await this.repository.Find({
      vendorId,
      orderStatus: OrderStatus.PENDING,
      id,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const payload = {
      orderStatus: OrderStatus.CONFIRMED,
    };
    await this.repository.updateOrder(payload, order.id);
    const deliveries = (await DeliveryProfileModel.findAll({
      include: DeliveryModel,
    })) as unknown as DeliveryProfile[];
    const vendorProfile = (await VendorProfileModel.findOne({
      where: { vendorId },
    })) as unknown as VendorProfile;
    let deliveryMan: DeliveryProfile[] = [];

    io.emit("orderUpdate", { order, user: order.userId });
    deliveries.map((delivery: DeliveryProfile) => {
      const valid = geolib.isPointWithinRadius(
        { latitude: delivery.latitude, longitude: delivery.longitude },
        { latitude: delivery.latitude, longitude: delivery.longitude },
        10000
      );

      valid && deliveryMan.push(delivery);
    });
    if (deliveryMan.length > 0) {
      deliveryMan.map((delivery) => {
        io.emit("order request", { order, delivery: delivery.deliveryManId });
      });
    }

    return "order updated successfully";
  }
  async CancelOrder(vendorId: string, id: string) {
    const order = (await this.repository.Find({
      vendorId,
      id,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const payload = {
      orderStatus: OrderStatus.CANCELED,
    };
    await this.repository.updateOrder(payload, order.id);
    const delivery = await DeliveryProfileModel.findAll({});

    io.emit("orderUpdate", {
      order: "your order has been cancelled",
      user: order.userId,
    });
    return "order updated successfully";
  }
  private formatProduct(productData: any) {
    return {
      id: productData.dataValues.id,

      category: {
        id: productData.dataValues.CategoryModel.dataValues.id,
        name: productData.dataValues.CategoryModel.dataValues.name,
        image: productData.dataValues.CategoryModel.dataValues.image,
      },
      module: {
        id: productData.dataValues.ModuleModel.dataValues.id,
        name: productData.dataValues.ModuleModel.dataValues.name,
        image: productData.dataValues.ModuleModel.dataValues.image,
      },
      itemName: productData.dataValues.itemName,
      categoryId: productData.dataValues.categoryId,
      moduleId: productData.dataValues.moduleId,
      price: parseFloat(productData.dataValues.price), // Convert to number
      totalStock: productData.dataValues.totalStock,
      ItemImages: productData.dataValues.ItemImages,
      Description: productData.dataValues.Description,
      rating: productData.dataValues.rating,
      available: productData.dataValues.available as Availability, // Assuming `available` is of type Availability
      ownerId: productData.dataValues.ownerId,
      numRating: productData.dataValues.numRating,
      Attribute: productData.dataValues.Attribute,
      unit: productData.dataValues.unit,
      Vat: productData.dataValues.Vat,
    };
  }
  async receivedOrder(id: string, userId: string) {
    // const order = await this.repository.Find({
    //   orderStatus: OrderStatus.,
    //   userId,
    // });
    // if (!order) {
    //   throw new BadRequestError("order not found", "");
    // }
    // const update = await this.repository.updateOrder(
    //   { orderStatus: OrderStatus.RECEIVED },
    //   id
    // );
    // return update[1][0].dataValues;
  }
  async acceptOrder(id: string, orderId: string) {
    const delivery = (await DeliveryModel.findByPk(id)) as unknown as Delivery;

    const order = (await this.repository.Find({
      id: orderId,
      orderStatus: OrderStatus.CONFIRMED,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError(
        "This order has been assigned to another vendor",
        ""
      );
    }

    const update = await this.repository.updateOrder(
      { orderStatus: OrderStatus.OUT_FOR_DELIVERY, deliveryMan: id },
      orderId
    );
    io.emit("orderUpdate", { order: update, user: order.userId });

    return update[1][0].dataValues;
  }
  async DeliveredOrder(id: string, deliveryMan: string) {
    const order = await this.repository.Find({
      id,
      orderStatus: OrderStatus.OUT_FOR_DELIVERY,
      deliveryMan,
    });
    if (!order) {
      throw new BadRequestError("order not found", "");
    }

    const update = await this.repository.updateOrder(
      { orderStatus: OrderStatus.CONFIRMED },
      id
    );
    return update[1][0].dataValues;
  }

  async returnOrder(orderId: string, userId: string) {
    const order = (await this.repository.Find({
      id: orderId,
      orderStatus: OrderStatus.OUT_FOR_DELIVERY,
      userId,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("this order does not exist", "");
    }

    const orderUpdate = await this.repository.updateOrder(
      { orderStatus: OrderStatus.RETURNED },
      orderId
    );

    io.emit("returnOrder", { order: orderUpdate, vendor: order.vendorId });
  }
  async TrackUserOrders(userId: string) {
    const orders = await this.repository.FindAll({ userId });
    return orders;
  }
  async TrackUserOrder(userId: string, id: string) {
    const order = await this.repository.Find({ userId, id });
    return order;
  }
}

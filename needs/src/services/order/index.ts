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

 
  ShopModel,

  Transaction,
  TransactionType,
  OrderStatus,

  Wallet,
  DeliveryModel,
  DeliveryProfileModel,
  DeliveryProfile,
  DeliveryProfileRepository,

  Delivery,
  PaymentRepository,
  PaymentStatus,
  Type,
  Payment,
  AdminType,
  AdminPaymentStatus,
  WalletRepository,
  AdminWalletRepository,
  AdminPaymentRepository,
  AdminWallet,
  
  ShopPaymentRepository,
  ShopWalletRepository,
  ShopRepository,
  Shop,
  ShopWallet
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  InitializeValidation,
  OrderValidationSchema,
  option,
  OrderValidation,
  cancelOrderValidations,
  OrderCompletedValidation,
} from "./validation";
import { userSocketMap } from "../../config/socket";
import { Op } from "sequelize";
import { WalletService, TransactionService, AdminWalletService } from "../";
import { v4 as uuid } from "uuid";
import { io } from "../../config/socket";
import { Utils } from "../../utils";
import { PaymentService } from "../";
import axios from "axios";
import {
  DeliveryOrder,
  PAYSTACK_API,
  UserOrder,
  VendorOrder,
} from "../../config/constant";
import * as geolib from "geolib";

import { AdminPaymentService } from "../admin-payment";


export class OrderService {
  private repository: OrderRepository;
  private wallet: WalletService;
  private transaction: TransactionService;
  private cart: CartRepository;
  private productRepo: ProductRepository;
  private shopRepository: ShopRepository;
  private deliveryProfile: DeliveryProfileRepository;
  private payment: PaymentRepository;
  private walletReo: WalletRepository;
  private adminWallet: AdminWalletRepository;
  private adminPayment: AdminPaymentRepository;
  private shopWalletRepository: ShopWalletRepository;
  private shopPaymentRepository: ShopPaymentRepository;

  constructor() {
    this.shopRepository = new ShopRepository();
    this.repository = new OrderRepository();
    this.wallet = new WalletService();
    this.transaction = new TransactionService();
    this.cart = new CartRepository();
    this.productRepo = new ProductRepository();
    this.deliveryProfile = new DeliveryProfileRepository();
    this.payment = new PaymentRepository();
    this.walletReo = new WalletRepository();
    this.adminWallet = new AdminWalletRepository();
    this.adminPayment = new AdminPaymentRepository();
    this.shopWalletRepository = new ShopWalletRepository();
    this.shopPaymentRepository = new ShopPaymentRepository();
    this.shopRepository =  new ShopRepository()
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
 
    const shop =  await this.shopRepository.getShop(input.shopId) as unknown as Shop
    if (!shop) {
      throw new BadRequestError("shop does not exist", "");
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
        shopId: input.shopId,
      })) as unknown as Product;

      if (!product) {
        throw new BadRequestError(
          "This product is not associated with this shop",
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
    //discount
    // Validate total price
    if (totalPrice !== newCart.totalAmount) {
      throw new BadRequestError(
        `Total amount expected ${totalPrice} but total price gotten ${newCart.totalAmount}`,
        ""
      );
    }

    const trackingCode = Utils.generateTrackingCode();
    // Perform payment
    if (input.paymentType === PaymentType.USER_WALLET) {
      const wallet = await this.processWalletPayment(totalPrice, ownerId);

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
        description: `you made order from ${shop.shopDetails.storeName}
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
      };
      order = {
        id: uuid(),
        referenceId: wallet.id,
        cartId: input.cartId,
        userId: ownerId,
        totalAmount: totalPrice,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
        transactionId: "",
        trackingCode,
        shopId:input.shopId
      };
    } else if (input.paymentType === PaymentType.BANK_TRANSFER) {
      const res = await this.processPaystackPayment(
        input.referenceId,
        totalPrice,
        ownerId
      );
      payment = {
        id: uuid(),
        status: PaymentStatus.SUCCESS,
        merchant: "paystack",
        amount: totalPrice,
        userId: ownerId,
        referenceId: input.referenceId,
        paymentType: PaymentType.BANK_TRANSFER,
        type: Type.DEBIT,
      };
      transaction = {
        userId: ownerId,
        amount: totalPrice,
        type: TransactionType.PURCHASE,
        referenceId: input.referenceId,
        paymentId: "",
        id: uuid(),
        description: `you made order from ${shop.shopDetails.storeName}
      } store  on ${new Date().toLocaleDateString("en-GB")}.`,
      };
      order = {
        id: uuid(),
        referenceId: input.referenceId,
        cartId: input.cartId,
        userId: ownerId,
        totalAmount: totalPrice,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
        transactionId: "",
        trackingCode,
        shopId:input.shopId
      };
    } else if (input.paymentType === PaymentType.CASH_ON_DELIVERY) {
      payment = {
        id: uuid(),
        status: PaymentStatus.PENDING,
        merchant: "",
        amount: totalPrice,
        userId: ownerId,
        referenceId: ownerId,
        paymentType: PaymentType.CASH_ON_DELIVERY,
        type: Type.DEBIT,
      };
      transaction = {
        userId: ownerId,
        amount: totalPrice,
        type: TransactionType.PURCHASE,
        referenceId: ownerId,
        id: uuid(),
        description: `you made order from ${shop.shopDetails.storeName}
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
        paymentId: "",
      };
      order = {
        id: uuid(),
        referenceId: ownerId,
        cartId: input.cartId,
        userId: ownerId,       
        totalAmount: totalPrice,
        paymentType: input.paymentType,
        orderStatus: OrderStatus.PENDING,
        transactionId: "",
        trackingCode,
        shopId:input.shopId
      };
    } else {
      throw new BadRequestError("invalid payment type", "");
    }

    // // Update product quantities
    await Promise.all(
      newProduct.map((product) => this.updateProductQuantity(product))
    );

    const payed = (await this.payment.create(payment)) as unknown as Payment;

    transaction.paymentId = payed.id;
    // Create transaction
    const transact = (await this.transaction.createTransaction(
      transaction
    )) as unknown as Transaction;

    order.transactionId = transact.id;

    // // Create order
    const Order = await this.repository.create(order);

    // // Update cart status
    await this.cart.updateCart(
      { status: CartStatus.CLOSED },
      { id: input.cartId, ownerId }
    );
    await this.shopPaymentRepository.create({
      id: uuid(),
      order: Order.dataValues.id,
      amount: Order.dataValues.totalAmount,
      merchant: "",
      referenceId: "",
      status: PaymentStatus.PENDING,
      type: Type.CREDIT,
      paymentType: PaymentType.USER_WALLET,
      shopId: order.shopId,
    });
    if (input.paymentType !== PaymentType.CASH_ON_DELIVERY) {
      await this.CreditAdminWallet(Order.dataValues.id, totalPrice);
     
    }
  
    const socketId = userSocketMap.get(input.shopId);
   
    if (socketId) {
      io.to(socketId).emit(VendorOrder, { message: "you have a new order" });
    }

    // // Emit event for new order
    // io.emit(VendorOrder, { message:"you have a new Order", vendor: input.vendorId });

    return "Order was successful";
  }

  private async processWalletPayment(totalPrice: number, ownerId: string) {
    const wallet = (await this.wallet.debitWallet(
      totalPrice,
      ownerId
    )) as Wallet;

    return wallet;
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
    
      totalAmount: cartModel.dataValues.totalAmount,
      status: cartModel.dataValues.status as CartStatus, // Assuming status is of type CartStatus
      ownerId: cartModel.dataValues.ownerId,
      shopId:cartModel.dataValues.shopId
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
  async getAllMyOrders(shopId: string) {
    return await this.repository.FindAll({ shopId });
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
  async processOrder(shopId: string, id: string) {
    const order = (await this.repository.Find({
      shopId,
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
    const shop = (await this.shopRepository.getShop(shopId)) as unknown as Shop;
    let deliveryMan: DeliveryProfile[] = [];

    io.emit(UserOrder, { order, user: order.userId });
    deliveries.map((delivery: DeliveryProfile) => {
      const valid = geolib.isPointWithinRadius(
        { latitude: delivery.latitude, longitude: delivery.longitude },
        { latitude: shop.shopDetails.latitude, longitude: shop.shopDetails.longitude },
        10000
      );

      valid && deliveryMan.push(delivery);
    });
    if (deliveryMan.length > 0) {
      deliveryMan.map((delivery) => {
        const socketId = userSocketMap.get(delivery.deliveryManId);
        if (socketId) {
          io.to(socketId).emit(DeliveryOrder, {
            message: "new order for pickup",
          });
        }
      });
      return "order updated successfully";
    } else {
      return "no delivery man is in your vaccinity";
    }
  }
  async CancelOrder(shopId: string, id: string, input: any) {
    const { error } = cancelOrderValidations.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const order = (await this.repository.Find({
      shopId,
      id,
      orderStatus: {
        [Op.not]: OrderStatus.CONFIRMED,
      },
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const payload = {
      orderStatus: OrderStatus.CANCELED,
      CancelOrderReason: input.CancelOrderReason,
    };
    await this.repository.updateOrder(payload, order.id);
    const delivery = await DeliveryProfileModel.findAll({});

    const socketId = userSocketMap.get(order.userId);
    if (socketId) {
      io.to(socketId).emit(UserOrder, {
        message: "your order has been cancelled",
      });
    }
    const wallet = (await this.walletReo.walletBalance({
      ownerId: order.userId,
    })) as unknown as Wallet;
    if (wallet) {
      const credit = Number(wallet?.credit) + order.totalAmount,
        balance = (wallet.balance as number) + order.totalAmount;
      await this.walletReo.update(order.userId, { credit, balance });
      await this.DebitAdminWallet(order.id, order.totalAmount);
      await this.shopPaymentRepository.update(
        { order: order.id, shopId: order.shopId },
        { status: PaymentStatus.FAILED }
      );
    }

    // io.emit(UserOrder, {
    //   order: "your order has been cancelled",
    //   user: order.userId,
    // });
    //user get his money back
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
      shopId: productData.dataValues.shopId,
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

    return update[1][0].dataValues;
  }
  async orderCompleted(id: string, deliveryMan: string, input: any) {
    const { error } = OrderCompletedValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const order = (await this.repository.Find({
      id,
      orderStatus: OrderStatus.OUT_FOR_DELIVERY,
      deliveryMan,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    if (order.trackingCode !== input.trackingCode) {
      throw new BadRequestError("invalid tracking code", "");
    }

    const update = await this.repository.updateOrder(
      { orderStatus: OrderStatus.CONFIRMED },
      id
    );
    const shopWallet = (await this.shopWalletRepository.getWallet({
      shopId: order.shopId,
    })) as unknown as ShopWallet;
    if (shopWallet) {
      const credit = Number(shopWallet.credit) + order.totalAmount,
        balance = Number(shopWallet.balance) + order.totalAmount;

      await this.shopWalletRepository.update(order.shopId, {
        balance,
        credit,
      });
      await this.shopPaymentRepository.update(
        { order: order.id, shopId: order.shopId },
        { status: PaymentStatus.SUCCESS }
      );
      if (order.paymentType !== PaymentType.CASH_ON_DELIVERY) {
        await this.DebitAdminWallet(order.id, order.totalAmount);
      }
    }

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

    io.emit(VendorOrder, { order: orderUpdate, vendor: order.shopId });
  }
  async TrackUserOrders(userId: string) {
    const orders = await this.repository.FindAll({ userId });
    return orders;
  }
  async TrackUserOrder(userId: string, id: string) {
    const order = await this.repository.Find({ userId, id });
    return order;
  }

  async DebitAdminWallet(orderId: string, amount: number) {
    await this.adminWallet.debitWallet(amount);
    await this.adminPayment.create({
      id: uuid(),
      type: AdminType.DEBIT,
      orderId: orderId,
      status: AdminPaymentStatus.SUCCESS,
      amount: amount,
    });
  }
  async CreditAdminWallet(orderId: string, amount: number) {
    await this.adminWallet.creditWallet(amount);
    await this.adminPayment.create({
      id: uuid(),
      type: AdminType.CREDIT,
      orderId: orderId,
      status: AdminPaymentStatus.SUCCESS,
      amount: amount,
    });
  }
}

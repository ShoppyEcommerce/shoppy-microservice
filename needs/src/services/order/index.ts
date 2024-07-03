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
  ShopWallet,
  RiderRepository,
  ProfileRepository,
  Profile,
  RiderWalletRepository,
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
import { WalletService, TransactionService, AdminWalletService } from "..";
import { v4 as uuid } from "uuid";
import { io } from "../../config/socket";
import { Utils } from "../../utils";
import { PaymentService } from "..";
import axios from "axios";
import {
  DeliveryOrder,
  PAYSTACK_API,
  UserOrder,
  VendorOrder,
} from "../../config/constant";
import * as geolib from "geolib";

export class OrderService {
  private repository: OrderRepository;
  private wallet: WalletService;
  private transaction: TransactionService;
  private cart: CartRepository;
  private productRepo: ProductRepository;
  private shopRepository: ShopRepository;
  private profile: ProfileRepository;
  private payment: PaymentRepository;
  private walletReo: WalletRepository;
  private adminWallet: AdminWalletRepository;
  private adminPayment: AdminPaymentRepository;
  private shopWalletRepository: ShopWalletRepository;
  private shopPaymentRepository: ShopPaymentRepository;
  private riderRepository: RiderRepository;
  private riderWalletRepository: RiderWalletRepository;

  constructor() {
    this.shopRepository = new ShopRepository();
    this.repository = new OrderRepository();
    this.wallet = new WalletService();
    this.transaction = new TransactionService();
    this.cart = new CartRepository();
    this.productRepo = new ProductRepository();
    this.profile = new ProfileRepository();
    this.payment = new PaymentRepository();
    this.walletReo = new WalletRepository();
    this.adminWallet = new AdminWalletRepository();
    this.adminPayment = new AdminPaymentRepository();
    this.shopWalletRepository = new ShopWalletRepository();
    this.shopPaymentRepository = new ShopPaymentRepository();
    this.shopRepository = new ShopRepository();
    this.riderRepository = new RiderRepository();
    this.riderWalletRepository = new RiderWalletRepository();
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

    const shop = (await this.shopRepository.getShop(
      input.shopId
    )) as unknown as Shop;
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
    // if (totalPrice !== newCart.totalAmount) {
    //   throw new BadRequestError(
    //     `Total amount expected ${totalPrice} but total price gotten ${newCart.totalAmount}`,
    //     ""
    //   );
    // }

    const trackingCode = Utils.generateTrackingCode();
    // Perform payment
    if (input.paymentType === PaymentType.USER_WALLET) {
      const wallet = await this.processWalletPayment(
        Number(input?.subTotalAmount),
        ownerId
      );
      payment = this.createPayment(ownerId, Number(input?.subTotalAmount));
      transaction = this.createTransaction(
        shop,
        ownerId,
        Number(input?.subTotalAmount)
      );
      order = this.order(
        input,
        ownerId,
        totalPrice,
        Number(input?.subTotalAmount)
      );
    } else if (input.paymentType === PaymentType.BANK_TRANSFER) {
      const res = await this.processPaystackPayment(
        input.referenceId,
        Number(input?.subTotalAmount),
        ownerId
      );
      payment = this.createPayment(ownerId, Number(input?.subTotalAmount));
      transaction = this.createTransaction(
        shop,
        ownerId,
        Number(input?.subTotalAmount)
      );
      order = this.order(
        input,
        ownerId,
        totalPrice,
        Number(input?.subTotalAmount)
      );
    } else if (input.paymentType === PaymentType.CASH_ON_DELIVERY) {
      payment = this.createPayment(ownerId, Number(input?.subTotalAmount));
      transaction = this.createTransaction(
        shop,
        ownerId,
        Number(input?.subTotalAmount)
      );
      order = this.order(
        input,
        ownerId,
        totalPrice,
        Number(input?.subTotalAmount)
      );
    } else {
      throw new BadRequestError("invalid payment type", "");
    }

    // // Update product quantities
    await Promise.all(
      newProduct.map((product) => this.updateProductQuantity(product))
    );

    const payed = (await this.payment.create(payment)) as unknown as Payment;

    transaction.paymentId = payed.id;
    // Create createT
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
      amount: Number(Order.dataValues.subTotalAmount),
      merchant: "",
      referenceId: "",
      status: PaymentStatus.PENDING,
      type: Type.CREDIT,
      paymentType: PaymentType.USER_WALLET,
      shopId: order.shopId,
    });
    if (input.paymentType !== PaymentType.CASH_ON_DELIVERY) {
      await this.CreditAdminWallet(
        Order.dataValues.id,
        Number(input?.subTotalAmount)
      );
    }

    const socketId = userSocketMap.get(input.shopId);

    if (socketId) {
      io.to(socketId).emit(VendorOrder, { message: "you have a new order" });
    }
    if (input.deliveryAddress) {
      const profile = (await this.profile.getProfile({
        userId: ownerId,
      })) as unknown as Profile;
      if (profile && profile?.deliveryAddress?.length) {
        const exist = profile.deliveryAddress?.find(
          (item) => item === input.deliveryAddress
        );
        console.log(exist);
        if (!exist) {
          const update = await this.profile.update({userId:ownerId}, {
            deliveryAddress: [
              ...profile.deliveryAddress,
              input.deliveryAddress,
            ],
          });
        }
      }
    }

    // // Emit event for new order
    // io.emit(VendorOrder, { message:"you have a new Order", vendor: input.vendorId });

    return "Order was successful";
  }
  private createPayment = (ownerId: string, totalPrice: number) => {
    return {
      id: uuid(),
      status: PaymentStatus.PENDING,
      merchant: "",
      amount: totalPrice,
      userId: ownerId,
      referenceId: ownerId,
      paymentType: PaymentType.CASH_ON_DELIVERY,
      type: Type.DEBIT,
    };
  };
  private order = (
    input: any,
    ownerId: string,
    totalPrice: number,
    subTotalAmount: number
  ) => {
    const trackingCode = Utils.generateTrackingCode();
    return {
      id: uuid(),
      referenceId: ownerId,
      cartId: input.cartId,
      userId: ownerId,
      totalAmount: totalPrice,
      subTotalAmount,
      paymentType: input.paymentType,
      orderStatus: OrderStatus.PENDING,
      transactionId: "",
      trackingCode,
      shopId: input.shopId,
      deliveryAddress: input.deliveryAddress,
      deliveryOption: input.deliveryOption,
      additionalNotes: input.additionalNotes,
      floorNumber: input.floorNumber,
      houseNumber: input.houseNumber,
      doorNumber: input.doorNumber,
    };
  };
  private createTransaction = (
    shop: any,
    ownerId: string,
    totalPrice: number
  ) => {
    return {
      userId: ownerId,
      amount: totalPrice,
      type: TransactionType.PURCHASE,
      referenceId: ownerId,
      id: uuid(),
      description: `you made order from ${shop.shopDetails.storeName}
    } store  on ${new Date().toLocaleDateString("en-GB")}.`,
      paymentId: "",
    };
  };

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
      shopId: cartModel.dataValues.shopId,
    };
  };
  private WalletModel = (wallet: any) => {
    return {
      id: wallet.dataValues.id,
    };
  };
  async getAllMyOrder(id: string, shopId: string) {
    const order = await this.repository.Find({ id, shopId });
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
    // await this.repository.updateOrder(payload, order.id);
    // const deliveries = (await DeliveryProfileModel.findAll({
    //   include: DeliveryModel,
    // })) as unknown as DeliveryProfile[];
    // const shop = (await this.shopRepository.getShop(shopId)) as unknown as Shop;
    // let deliveryMan: DeliveryProfile[] = [];

    // io.emit(UserOrder, { order, user: order.userId });
    // deliveries.map((delivery: DeliveryProfile) => {
    //   const valid = geolib.isPointWithinRadius(
    //     { latitude: delivery.latitude, longitude: delivery.longitude },
    //     {
    //       latitude: shop.shopDetails.latitude,
    //       longitude: shop.shopDetails.longitude,
    //     },
    //     10000
    //   );

    //   valid && deliveryMan.push(delivery);
    // });
    // if (deliveryMan.length > 0) {
    //   deliveryMan.map((delivery) => {
    //     const socketId = userSocketMap.get(delivery.deliveryManId);
    //     if (socketId) {
    //       io.to(socketId).emit(DeliveryOrder, {
    //         message: "new order for pickup",
    //       });
    //     }
    //   });
    return "order updated successfully";
    // } else {
    //   return "no delivery man is in your vaccinity";
    // }
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
    // const delivery = await DeliveryProfileModel.findAll({});

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
      active: productData.dataValues.active,
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
      Attributes: productData.dataValues.Attributes,
      unit: productData.dataValues.unit,
      Vat: productData.dataValues.Vat,
      shopId: productData.dataValues.shopId,
      vatActive: productData.dataValues.vatActive,
      productSold: productData.dataValues.productSold,
    };
  }
  private formatOrder(order: any) {
    return {
      id: order.dataValues.id,
      shopId: order.dataValues.shopId,
      userId: order.dataValues.userId,
      deliveryMan: order.dataValues.deliveryMan,
      orderStatus: order.dataValues.orderStatus,
      totalAmount: order.dataValues.totalAmount,
      orderItems: order.dataValues.orderItems,
      deliveryOption: order.dataValues.deliveryOption,
      houseNumber: order.dataValues.houseNumber,
      doorNumber: order.dataValues.doorNumber,
      deliveryAddress: order.dataValues.deliveryAddress,
      floorNumber: order.dataValues.floorNumber,
      additionalNotes: order.dataValues.additionalNotes,
      subTotalAmount: order.dataValues.subTotalAmount,
      cart: {
        id: order.dataValues.CartModel.dataValues.id,

        totalAmount: order.dataValues.CartModel.dataValues.totalAmount,
        product: order.dataValues.CartModel.dataValues.products,
      },
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
    const rider = await this.riderRepository.findRiderById(id);
    if (!rider) {
      throw new BadRequestError("rider does not exist", "");
    }

    const order = (await this.repository.Find({
      id: orderId,
    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    if (order.orderStatus === OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestError(
        "This order has been assigned to another rider",
        ""
      );
    }
    if (order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new BadRequestError("This order is not available", "");
    }
    if (order.riderId) {
      throw new BadRequestError(
        "This order has been assigned to another rider",
        ""
      );
    }

    const update = await this.repository.updateOrder(
      { orderStatus: OrderStatus.OUT_FOR_DELIVERY, riderId: id },
      orderId
    );

    return update[1][0].dataValues;
  }
  async orderCompleted(riderId: string, id: string, input: any) {
    const { error } = OrderCompletedValidation.validate(input, option);
    if (error) {
      throw new BadRequestError(error.details[0].message, "");
    }
    const order = (await this.repository.findTrackingCode({
      id,
      orderStatus: OrderStatus.OUT_FOR_DELIVERY,
      riderId,
    })) as unknown as Order;

    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const newOrder = this.formatOrder(order);

    if (Number(order.trackingCode) !== Number(input.trackingCode)) {
      throw new BadRequestError("invalid tracking code", "");
    }

    if (order.paymentType !== PaymentType.CASH_ON_DELIVERY) {
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
        await this.DebitAdminWallet(order.id, order.totalAmount);
      }
    }
    await this.shopPaymentRepository.update(
      { order: order.id, shopId: order.shopId },
      { status: PaymentStatus.SUCCESS }
    );
    const formatOrder = this.formatOrder(order);

    await Promise.all(
      formatOrder.cart.product.map(async (product: any) => {
        const exist = (await this.productRepo.getAnyProduct({
          id: product.id,
        })) as unknown as Product;

        if (exist) {
          const sold = Number(exist.productSold) + product.Qty;

          await this.productRepo.update(
            {
              id: product.id,
            },
            { productSold: sold }
          );
        }
      })
    );

    const shop = (await this.shopRepository.getShop(
      order.shopId
    )) as unknown as Shop;
    if (shop) {
      const count =
        Number(shop.numOfProductSold ?? 0) + formatOrder.cart.product.length;

      await this.shopRepository.update({ numOfProductSold: count }, shop.id);
    }
    await this.repository.updateOrder(
      { orderStatus: OrderStatus.COMPLETED },
      id
    );

    return "updated";
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

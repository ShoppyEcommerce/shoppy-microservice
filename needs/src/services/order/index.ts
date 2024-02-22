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
  Delivery,
  DeliveryModel
} from "../../database";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import {
  InitializeValidation,
  OrderValidationSchema,
  option,
  OrderValidation
} from "./validation";
import { WalletService, TransactionService } from "../";
import { v4 as uuid } from "uuid";
import { io } from "../../config/socket";
import { Utils } from "../../utils";
import { PaymentService } from "../";
import axios from "axios";
import { PAYSTACK_API } from "../../config/constant";

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
    // Validate order input
    const { error, value } = OrderValidationSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }

    // Check if cart exists
    const cart = await this.cart.getOpenCart({
      id: input.cartId,
      ownerId,
      status: CartStatus.OPEN,
    });
    if (!cart) {
      throw new BadRequestError("Cart does not exist", "");
    }

    // Fetch vendor details
    const vendor = await VendorModel.findByPk(input.vendorId) as unknown as Vendor
    if (!vendor) {
      throw new BadRequestError("Vendor does not exist", "");
    }
  

    // Initialize variables
    let totalPrice: number = 0;
    let newProduct: Product[] = [];
    let transaction: Transaction = {} as Transaction;
    let order: Order = {} as Order;
    const newCart: Cart = this.mapCartModelToCart(cart);

    // Process products in the cart
    for (const cartItem of newCart.products) {
      const product = await this.productRepo.getProduct({
        id: cartItem.id,
        ownerId: input.vendorId,
      });

      // Validate product existence
      if (!product) {
        throw new BadRequestError(
          "This product is not associated with this vendor",
          ""
        );
      }
      const FormatData = this.formatProduct(product);

      // Calculate total price
      const price = cartItem.quantity * FormatData.price;
      if (price !== cartItem.amount) {
        throw new BadRequestError(
          "Product amount and quantity do not match",
          `${cartItem.amount}, ${cartItem.quantity}`
        );
      }
      totalPrice += price;

      // Update product quantity
      FormatData.quantity -= cartItem.quantity;
      if (FormatData.quantity === 0) {
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
    if (input.paymentType === PaymentType.WALLET) {
     const wallet =  await this.processWalletPayment(totalPrice, ownerId);
      transaction = {
        userId: ownerId,
        amount: totalPrice,
        type: "debit",
        referenceId: wallet.id,
        id: uuid(),
        description: `you made order from ${vendor.firstName} ${
          vendor.lastName
        } store  on ${new Date().toLocaleDateString("en-GB")}.`,
        product: newCart.products,
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
      };
    } else if (input.paymentType === PaymentType.PAYSTACK) {
      await this.processPaystackPayment(
        input.referenceId!,
        totalPrice,
        ownerId
      );
    } else {
      throw new BadRequestError("invalid payment type", "");
    }

    // Update product quantities
    await Promise.all(
      newProduct.map((product) => this.updateProductQuantity(product))
    );

    // Create transaction
    await this.transaction.createTransaction(transaction);

    // Create order
    await this.repository.create(order);

    // Update cart status
    await this.cart.updateCart(
      { status: CartStatus.CLOSED },
      { id: input.cartId, ownerId }
    );

    // Emit event for new order
    io.emit("newOrder", { order, vendor: input.vendorId });

    return "Order was successful";
  }

  private async processWalletPayment(totalPrice: number, ownerId: string) {
    const wallet = (await this.wallet.debitWallet(
      totalPrice,
      ownerId
    )) as Wallet;
    return this.WalletModel(wallet);
    // Process wallet payment and create transaction
  }

  private async processPaystackPayment(
    referenceId: string,
    totalPrice: number,
    ownerId: string
  ) {
    const payment = new PaymentService();
    const res = await payment.verifyTransaction(referenceId);
    // Process Paystack payment and verify transaction
  }

  private async updateProductQuantity(product: Product) {
    return this.productRepo.update(
      { id: product.id },
      {
        quantity: product.quantity,
        available:
          product.quantity === 0
            ? Availability.OUT_OF_STOCK
            : Availability.IN_STOCK,
      }
    );
  }

  // async createOrder(input: Order, ownerId: string) {
  //   const { error, value } = OrderValidationSchema.validate(input, option);
  //   if (error) {
  //     throw new ValidationError(error.details[0].message, "");
  //   }
  //   const cart = await this.cart.getOpenCart({
  //     id: input.cartId,
  //     ownerId,
  //     status: CartStatus.OPEN,
  //   });

  //   if (!cart) {
  //     throw new BadRequestError("cart does not exist", "");
  //   }
  //   const newCart = this.mapCartModelToCart(cart);

  //   let newProduct: Product[] = [];
  //   let totalPrice: number = 0;
  //   const vendor = (await VendorModel.findByPk(
  //     input.vendorId
  //   )) as unknown as Vendor;

  //   if (!vendor) {
  //     throw new BadRequestError("vendor does not exist", "");
  //   }

  //   for (const cart of newCart.products) {
  //     const product = (await this.productRepo.getProduct({
  //       id: cart.id,
  //       ownerId: input.vendorId,
  //     })) as unknown as Product;
  //     if (!product) {
  //       throw new BadRequestError(
  //         "this product is not associated with this vendor",
  //         ""
  //       );
  //     }
  //     const FormatData = this.formatProduct(product);
  //     if (FormatData.available === Availability.OUT_OF_STOCK) {
  //       throw new BadRequestError("this product is out of stock", "");
  //     }
  //     if (cart.quantity > FormatData.quantity) {
  //       throw new BadRequestError(
  //         `the quantity exceeds the limit of the product`,
  //         ``
  //       );
  //     }
  //     const price = cart.quantity * FormatData.price;
  //     if (Number(price) !== cart.amount) {
  //       throw new BadRequestError(
  //         "this product amount and quantity do not match",
  //         `${cart.amount}, ${cart.quantity}`
  //       );
  //     }
  //     totalPrice += price;

  //     FormatData.quantity = FormatData.quantity - cart.quantity;
  //     if (FormatData.quantity === 0) {
  //       product.available = Availability.OUT_OF_STOCK;
  //     }
  //     console.log(FormatData);
  //     newProduct.push(FormatData);
  //   }
  //   if (totalPrice !== newCart.totalAmount) {
  //     throw new BadRequestError(
  //       `total amount expected ${totalPrice} total price gotten ${newCart.totalAmount}`,
  //       ""
  //     );
  //   }

  //   let transaction = {} as Transaction;
  //   let order = {} as Order;

  //   if (input.paymentType === PaymentType.WALLET) {
  //     const wallet = (await this.wallet.debitWallet(
  //       totalPrice,
  //       ownerId
  //     )) as unknown as Wallet;
  //     const newWallet = this.WalletModel(wallet);

      // transaction = {
      //   userId: ownerId,
      //   amount: totalPrice,
      //   type: "debit",
      //   referenceId: newWallet.id,
      //   id: uuid(),
      //   description: `you made order from ${vendor.firstName} ${
      //     vendor.lastName
      //   } store  on ${new Date().toLocaleDateString("en-GB")}.`,
      //   product: newCart.products,
      // };
      // order = {
      //   id: uuid(),
      //   referenceId: newWallet.id,
      //   cartId: input.cartId,
      //   userId: ownerId,
      //   vendorId: input.vendorId,
      //   totalAmount: totalPrice,
      //   paymentType: input.paymentType,
      //   orderStatus: OrderStatus.PENDING,
      // };
  //   } else if (input.paymentType === PaymentType.PAYSTACK) {
  //     const payment = new PaymentService();
  //     const res = await payment.verifyTransaction(input.referenceId!);

  //     if (res.status === "success") {
  //       if (res.amount + 6800 !== totalPrice) {
  //         throw new BadRequestError(
  //           `expected amount to be ${totalPrice} but got ${res.amount}`,
  //           ""
  //         );
  //       }
  //     }
  //     order = {
  //       id: uuid(),
  //       referenceId: input.referenceId,
  //       cartId: input.cartId,
  //       userId: ownerId,
  //       vendorId: input.vendorId,
  //       totalAmount: totalPrice,
  //       paymentType: input.paymentType,
  //       orderStatus: OrderStatus.PENDING,
  //     };
  //     transaction = {
  //       userId: ownerId,
  //       amount: totalPrice,
  //       type: "debit",
  //       referenceId: input.referenceId,
  //       id: uuid(),
  //       description: `you made order from ${vendor.firstName} ${
  //         vendor.lastName
  //       } store  on ${new Date().toLocaleDateString("en-GB")}.`,
  //       product: newCart.products,
  //     };
  //   }
  //   const updates = newProduct.map(
  //     async (product) =>
  //       await this.productRepo.update(
  //         { id: product.id },
  //         {
  //           quantity: product.quantity,
  //           available:
  //             product.quantity === 0
  //               ? Availability.OUT_OF_STOCK
  //               : Availability.IN_STOCK,
  //         }
  //       )
  //   );

  //   // Wait for all update operations to complete
  //   await Promise.all(updates);

  //   await this.transaction.createTransaction(transaction);
  //   await this.repository.create(order);
  //   await this.cart.updateCart(
  //     { status: CartStatus.CLOSED },
  //     { id: input.cartId, ownerId }
  //   );
  //   io.emit("newOrder", { order, vendor: input.vendorId });
  //   return "order was successful";
  // }
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
  async getAllMyOrder(id: string, vendorId: string) {
    const order = await this.repository.Find({ id, vendorId });
    if (!order) {
      throw new BadRequestError("no order found", "");
    }

    return Utils.FormatData(order);
  }
  async getUserOrder (userId:string){
    const order =  await this.repository.FindAll({userId})
    return order

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
  async processOrder(
    vendorId: string,
    id:string
   
  ) {
  
    const order = (await this.repository.Find({
      vendorId,
      id

    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const payload = {
      orderStatus: OrderStatus.PROCESSING,
    
    };
    await this.repository.updateOrder(payload, order.id);
    io.emit("orderUpdate", { order, user: order.userId });
    return "order updated successfully";
  }
  async CancelOrder (vendorId:string, id:string){
    const order = (await this.repository.Find({
      vendorId,
      id

    })) as unknown as Order;
    if (!order) {
      throw new BadRequestError("order not found", "");
    }
    const payload = {
      orderStatus: OrderStatus.CANCELLED,
    };
    await this.repository.updateOrder(payload, order.id);
    io.emit("orderUpdate", { order:"your order has been cancelled", user: order.userId });
    return "order updated successfully";


  }
  private formatProduct(productData: any): Product {
    return {
      id: productData.dataValues.id,
      category: {
        id: productData.dataValues.category.id,
        name: productData.dataValues.category.name,
        image: productData.dataValues.category.image,
        active: productData.dataValues.category.active,
        moduleId: productData.dataValues.category.moduleId,
        createdAt: new Date(productData.dataValues.category.createdAt),
        updatedAt: new Date(productData.dataValues.category.updatedAt),
        ModuleModel: {
          id: productData.dataValues.category.ModuleModel.id,
          name: productData.dataValues.category.ModuleModel.name,
          active: productData.dataValues.category.ModuleModel.active,
          image: productData.dataValues.category.ModuleModel.image,
          createdAt: new Date(
            productData.dataValues.category.ModuleModel.createdAt
          ),
          updatedAt: new Date(
            productData.dataValues.category.ModuleModel.updatedAt
          ),
        },
      },
      name: productData.dataValues.name,
      categoryId: productData.dataValues.categoryId,
      moduleId: productData.dataValues.moduleId,
      price: parseFloat(productData.dataValues.price), // Convert to number
      quantity: productData.dataValues.quantity,
      images: productData.dataValues.images,
      description: productData.dataValues.description,
      rating: productData.dataValues.rating,
      available: productData.dataValues.available as Availability, // Assuming `available` is of type Availability
      ownerId: productData.dataValues.ownerId,
      numRating: productData.dataValues.numRating,
    };
  }
}

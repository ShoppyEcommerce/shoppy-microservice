import {
  Cart,
  CartRepository,
  VendorRepository,
  CartStatus,
} from "../../database";
import { v4 as uuid } from "uuid";
import { CartValidationSchema,option } from "./validation";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";

export class CartService {
  private repository: CartRepository;
  private vendor: VendorRepository;
  constructor() {
    (this.repository = new CartRepository()),
      (this.vendor = new VendorRepository());
  }

  async createCart(input: Cart, ownerId: string) {
    const { error, value } = CartValidationSchema.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    input.ownerId = ownerId;
    const vendor = await this.vendor.Find({
      id: input.vendor,
      isVerified: true,
    });
    if (!vendor) {
      throw new BadRequestError("invalid vendor", "");
    }
    const exist = (await this.repository.getOpenCart({
      ownerId: input.ownerId,
      status: CartStatus.OPEN,
    })) as unknown as Cart;

    if (exist) {
      const cart = this.mapCartModelToCart(exist);

      if (cart.vendor !== input.vendor) {
        throw new BadRequestError(
          "only one vendor can be assigned to a cart",
          ""
        );
      }

      const update = await this.updateCart(cart, input);
      return "added to cart";
    } else {
      input.id = uuid();
      await this.repository.createCart(input);
      return "new product added to cart";
    }
  }
  async updateCart(input: Cart, data: Cart) {
    const productToUpdate = data.products[0]; // Assuming only one product is updated at a time

    // Find the index of the product in the input cart
    const index = input.products.findIndex(
      (product) => product.id === productToUpdate.id
    );

    if (index !== -1) {
      // If the product exists in the cart, update its quantity
      input.products[index].quantity += productToUpdate.quantity;
      input.products[index].amount += productToUpdate.amount;
    } else {
      // If the product doesn't exist in the cart, add it
      input.products.push(productToUpdate);
    }

    // Perform any other necessary updates to the cart

    // Example: Recalculate total amount
    input.totalAmount = input.products.reduce(
      (total, product) => total + product.amount,
      0
    );
    console.log(input);

    // Save the updated cart to the repository
    return await this.repository.updateCart(input, input);
  }
  async getCart(ownerId: string) {
    return await this.repository.getOpenCart({
      ownerId,
      status: CartStatus.OPEN,
    });
  }

  async deleteCart(ownerId: string, id: string) {
    const cart = await this.repository.getOpenCart({
      id,
      ownerId,
      status: CartStatus.OPEN,
    });
    if (!cart) {
      throw new BadRequestError("cart does not exists", "");
    }
    return this.repository.deleteCart({ id, ownerId });
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
}

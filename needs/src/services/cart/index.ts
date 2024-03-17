import {
  Cart,
  CartRepository,
  VendorRepository,
  CartStatus,
} from "../../database";
import { v4 as uuid } from "uuid";
import { CartValidationSchema, option } from "./validation";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";

export class CartService {
  private repository: CartRepository;
  private vendor: VendorRepository;
  constructor() {
    (this.repository = new CartRepository()),
      (this.vendor = new VendorRepository());
  }

  async createCart(input: any, ownerId: string) {
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
      await this.updateCart(cart, input);
      return "added to cart";
    } else {
      input.id = uuid();
      input.products = [input.products];
      await this.repository.createCart(input);
    }

    // if (exist) {
    //   const cart = this.mapCartModelToCart(exist);

    // if (cart.vendor !== input.vendor) {
    //   throw new BadRequestError(
    //     "only one vendor can be assigned to a cart",
    //     ""
    //   );
    // }

    //   const update = await this.updateCart(cart, input);
    //   return "added to cart";
    // } else {
    // input.id = uuid();
    // await this.repository.createCart(input);
    //   return "new product added to cart";
    // }
  }
  async updateCart(input: Cart, data: any) {
    const productToUpdate = data.products; // Assuming only one product is updated at a time


    // Find the index of the product in the input cart
    const index = input.products.findIndex(
      (product) => product.id === productToUpdate.id
    );

    if (index !== -1) {
      // If the product exists in the cart, update its quantity
      input.products[index].Qty += productToUpdate.Qty;
      input.products[index].amount += productToUpdate.amount;
    } else {
      // If the product doesn't exist in the cart, add it
      input.products.push(productToUpdate);
    }
  

    // // Perform any other necessary updates to the cart

    // // Example: Recalculate total amount
    input.totalAmount = input.products.reduce(
      (total, product) => total + product.amount,
      0
    );


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
        Qty: product.Qty,
        amount: product.amount,
      })),
      vendor: cartModel.dataValues.vendor,
      totalAmount: cartModel.dataValues.totalAmount,
      status: cartModel.dataValues.status as CartStatus, // Assuming status is of type CartStatus
      ownerId: cartModel.dataValues.ownerId,
    };

  };
  async deleteCartItem (input:{cartId:string, productId:string}, ownerId:string){
    const cart = await this.repository.getOpenCart({
      id: input.cartId,
      ownerId,
      status: CartStatus.OPEN,
    }) as unknown as Cart
    if (!cart) {
      throw new BadRequestError("cart does not exists", "");
    }
    const product = cart.products.find((product) => product.id === input.productId);
    if (!product) {
      throw new BadRequestError("product does not exists in the cart", "");
    }
    cart.products = cart.products.filter((product) => product.id !== input.productId);
    cart.totalAmount = cart.products.reduce(
      (total, product) => total + product.amount,
      0
    );
    if(cart.products.length === 0 ){
       await this.repository.deleteCart({id:cart.id, ownerId})
       return  "cart deleted successfully"
    }
    const updated =  await this.repository.updateCart({products:cart.products, totalAmount:cart.totalAmount}, {id:cart.id, ownerId});
    return updated[1][0].dataValues

  }
  async ReduceProductQty(input: { cartId: string; productId: string }, ownerId: string) {
    // Reduce the quantity of a product in the cart
    const cart = await this.repository.getOpenCart({
      id: input.cartId,
      status: CartStatus.OPEN,
      ownerId,
    }) as unknown as Cart;
    
    if (!cart) {
      throw new BadRequestError("Cart does not exist", "");
    }
  
    const productIndex = cart.products.findIndex((product) => product.id === input.productId);
    
    if (productIndex === -1) {
      throw new BadRequestError("Product does not exist in the cart", "");
    }
  
    const product = cart.products[productIndex];
  
    if (product.Qty === 1) {
      // If the quantity is 1, remove the product from the cart
      cart.products.splice(productIndex, 1);
    } else {
      // If the quantity is greater than 1, reduce the quantity by 1
      let singleAmount =  product.amount / product.Qty;
      product.Qty -= 1;

      product.amount -= singleAmount; // Assuming the amount is calculated based on the price
    }
  
    // Recalculate totalAmount based on updated product quantities and amounts
    cart.totalAmount = cart.products.reduce((total, product) => total + product.amount, 0);
    if(cart.products.length === 0 ){
      await this.repository.deleteCart({id:cart.id, ownerId})
      return  "cart deleted successfully"
   }
  
    // Update the cart in the database
    const updated =  await this.repository.updateCart({ products: cart.products, totalAmount: cart.totalAmount }, { id: cart.id, ownerId });
    return updated[1][0].dataValues
  }
  
}

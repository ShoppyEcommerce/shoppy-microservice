// import { FavoriteRepository } from "../database/Repository/favourite-repository";
// import { ProductRepository } from "../database/Repository/product-repository";
// import { Favorite } from "../database/model";
// import { Utils } from "../utils";
// import { BadRequestError, ValidationError } from "../utils/ErrorHandler";
// import { FavoriteSchema, option } from "./validation";
// import { v4 as uuid } from "uuid";

// export class FavoriteService {
//   private repository: FavoriteRepository;
//   constructor() {
//     this.repository = new FavoriteRepository();
//   }
//   async createFavorite(input: Favorite) {
//     const { error, value } = FavoriteSchema.validate(input, option);
//     if (error) {
//       throw new ValidationError(error.details[0].message, "");
//     }
//     const product = await new ProductRepository().getProduct({
//       id: value.productId,
//     });
//     if (!product) {
//       throw new BadRequestError("This product does not exists", "");
//     }
//     value.id = uuid();
//     const favorite = await this.repository.create(value);
//     return Utils.FormatData(favorite);
//   }
//   async getFavorite(userId: string, id: string) {
//     const favorite = await this.repository.getFavorite({ userId, id });
//     if (!favorite) {
//       throw new BadRequestError("favorite Not found", "");
//     }
//     return Utils.FormatData(favorite);
//   }
//   async getFavorites(userId: string) {
//     const favorite = await this.repository.getFavorites({ userId });
//     return Utils.FormatData(favorite);
//   }
//   async deleteFavorite(userId: string, id: string) {
//     const exist = await this.repository.getFavorite({ userId, id });
//     if (!exist) {
//       throw new BadRequestError("Not found", "");
//     }
//     const favorite = await this.repository.delete({ userId, id });
//     return Utils.FormatData(favorite);
//   }
// }

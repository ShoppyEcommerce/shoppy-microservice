// import { Favorite, FavoriteModel, ProductModel } from "../model";

// export class FavoriteRepository {
//   async create(input: Favorite) {
//     const favorite = await FavoriteModel.create(input);
//     return favorite;
//   }
//   async getFavorite(input: Record<string, string>) {
//     const favorite = await FavoriteModel.findOne({
//       where: input,
//       include: [ProductModel],
//     });
//     return favorite;
//   }

//   async getFavorites(input: { userId: string }) {
//     return FavoriteModel.findAll({ where: input, include: [ProductModel] });
//   }
//   async delete(input: { userId: string; id: string }) {
//     await FavoriteModel.destroy({ where: input });
//     return "favorite deleted";
//   }
// }

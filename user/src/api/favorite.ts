// import { Channel } from "amqplib";
// import { Application, NextFunction, Request, Response } from "express";
// import { AuthMiddleware } from "./middleware/auth";
// import { FavoriteService } from "../services/favorite-service";

// export default (app: Application, channel: Channel) => {
//   const service = new FavoriteService();
//   app.post(
//     "/favorite",
//     AuthMiddleware.Authenticate(["user"]),
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const body = {
//           ...req.body,
//           userId: req.user,
//         };
//         const favorite = await service.createFavorite(body);
//         return res.status(201).json(favorite);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/favorite/:id",
//     AuthMiddleware.Authenticate(["user"]),
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const favorite = await service.getFavorite(req.user, req.params.id);
//         return res.status(200).json(favorite);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.get(
//     "/favorite",
//     AuthMiddleware.Authenticate(["user"]),
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const favorite = await service.getFavorites(req.user);
//         return res.status(200).json(favorite);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
//   app.delete(
//     "/favorite/:id",
//     AuthMiddleware.Authenticate(["user"]),
//     async (req: Request | any, res: Response, next: NextFunction) => {
//       try {
//         const favorite = await service.deleteFavorite(req.user, req.params.id);
//         return res.status(200).json(favorite);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );
// };

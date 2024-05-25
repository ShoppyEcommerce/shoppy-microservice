import {RiderWalletModel, RiderWallet} from ".."

export class RiderWalletRepository {
    async create(input: { riderId: string; id: string }) {
    return await RiderWalletModel.create(input);
    
      
      }
      async getWallet(input: Partial<RiderWallet>) {
        return RiderWalletModel.findOne({ where: input });
      }
      async update(riderId: string, update: any) {
        return await RiderWalletModel.update(update, {
          where: { riderId },
          returning: true,
        });
      }


}
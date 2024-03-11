import { AdminWalletModel, AdminWallet } from "../model";

export class AdminWalletRepository {
  async create(input: AdminWallet) {
    await AdminWalletModel.create(input);
  }
  async findOne(){
   return await AdminWalletModel.findOne()
  }

 async creditWallet (amount: number){
   const wallet = await this.findOne() 
   if(wallet){
     wallet.dataValues.balance += amount
     wallet.dataValues.balance += amount
     await wallet.save()

   }
 }
  async debitWallet(amount: number){
    const wallet = await this.findOne()
    if(wallet){
      wallet.dataValues.balance -= amount
      wallet.dataValues.debit += amount
      await wallet.save()
    }
  }
}

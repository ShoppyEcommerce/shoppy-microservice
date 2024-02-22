import { User, UserModel } from "../model";



export class UserRepository {
    async createUser(input:User)  {
     return  await UserModel.create(input)
  

    }
    async Find(input:Record<string, string>){
        
      return await UserModel.findOne({where:input})

   }
  
}
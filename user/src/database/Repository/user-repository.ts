import { User, UserModel } from "../model";



export class UserRepository {
    async createUser(input:User) : Promise<User> {
      const user =   await UserModel.create(input) as unknown as User
      return user

    }
    async Find(input:Record<string, string>){
        
      return await UserModel.findOne({where:input})

   }
}
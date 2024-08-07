import { DeliveryAddress, User, UserModel } from "../model";

export class UserRepository {
  async createUser(input: User) {
    return await UserModel.create(input);
  }
  async Find(input: Partial<User>) {
    return await UserModel.findOne({
      where: {...input, active:true},
      include: [
        {
          model: DeliveryAddress,
        },
      ],
    });
  }
  async findAll() {
    return await UserModel.findAll({
      where: {
        role: "user",
        active:true
      },
    });
  }
  async update(update: Partial<User>, id: string) {
    await UserModel.update(update, { where: { id, active:true } });
  }

  async deleteAccount(id: string) {
    await UserModel.destroy({ where: { id } });
  }
}

import { UserModel, Profile, ProfileModel } from "../model";


export class ProfileRepository {
  async create(input: Profile) {
    const profile = await ProfileModel.create(input);
    return profile;
  }
  async getProfile(input: Record<string, string>) {
    const profile = await ProfileModel.findOne({
      where: input,
      include: [
        {
          model:UserModel,
          attributes:["id","firstName","lastName","email","phone"]
        }
      ],
    });
    return profile;
  }
  async update(id: string, update: any) {
    const profile = await ProfileModel.update(update, { where: { id }, returning: true, });
    
    return profile;
  }
  async delete(input: { id: string }) {
    await ProfileModel.destroy({ where: input });
    return "profile deleted";
  }
}

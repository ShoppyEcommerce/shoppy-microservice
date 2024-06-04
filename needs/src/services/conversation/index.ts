import {
  ConversationRepository,
  Conversation,
  ConversationSchema,
  UserModel,
  // VendorModel,

} from "../../database";
import { v4 as uuid } from "uuid";
import { conversationValidation, option } from "./validation";
import { Op } from "sequelize";
import { Utils } from "../../utils";
import { ValidationError } from "../../utils/ErrorHandler";

export class ConversationService {
  private conversationRepository: ConversationRepository;
  constructor() {
    this.conversationRepository = new ConversationRepository();
  }
  async createConversation(input: Conversation, user: any) {
    const { error } = conversationValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const exist = await ConversationSchema.findOne({
        where: {
            [Op.or]: [
                {
                    senderId:user.id,
                    receiverId:input.receiverId
                },
                {
                    senderId:input.receiverId,
                    receiverId:user.id
                }
               
               
                    
            ]
        },
    });
  
    if (!exist) {
      input.id = uuid();
      (input.sender = user),
        (input.receiver = await Utils.getModel(input.receiverId));
      input.senderId = user.id;
      input.members = [user.id, input.receiverId];
      return await this.conversationRepository.createConversation(input);
    }
    return;
  }
  async getConversationById(id: string) {
    return await this.conversationRepository.getConversationById(id);
  }
  async getUserConversation(id: string) {
    return await ConversationSchema.findAll({
      where: {
        members: {
          [Op.contains]: [id],
        },
      },
    });
  }
  async getConversationByMembers(members: Array<string>) {
    return await this.conversationRepository.getConversationByMembers(members);
  }
}

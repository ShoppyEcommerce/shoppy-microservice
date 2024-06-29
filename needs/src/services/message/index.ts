import { io, userSocketMap } from "../../config/socket";
import { Message, MessageModel, MessageRepository } from "../../database";
import { ValidationError } from "../../utils/ErrorHandler";
import { messageValidation, option } from "./validation";
import { v4 as uuid } from "uuid";

export class MessageService {
  private repository: MessageRepository;
  constructor() {
    this.repository = new MessageRepository();
  }
  async create(input: Message) {
    const { error } = messageValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    input.id = uuid();

    return await this.repository.create(input);
  }
  async getAllMessage(conversationId: string) {
    return await MessageModel.findAll({
      where: {
        conversationId,
      },
    });
  }
}

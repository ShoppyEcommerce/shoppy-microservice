import { ConversationRepository,Conversation } from "../../database";
import {v4 as uuid} from "uuid"
import { conversationValidation, option } from "./validation";


export class ConversationService {
    private conversationRepository: ConversationRepository;
    constructor() {
        this.conversationRepository = new ConversationRepository();
    }
    async createConversation(input: Conversation) {
        const {error} = conversationValidation.validate(input, option)
        input.id = uuid()
        return await this.conversationRepository.createConversation(input);
    }
    async getConversationById(id: string) {
        return await this.conversationRepository.getConversationById(id);
    }
    async getConversationByMembers(members: Array<string>) {
        return await this.conversationRepository.getConversationByMembers(members);
    }
   
}
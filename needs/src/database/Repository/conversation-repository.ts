import { Conversation, ConversationSchema } from "../model/conversation";


export class ConversationRepository {
    async createConversation(input: Conversation) {
        return await ConversationSchema.create(input);
    }
    
   async getConversationById(id: string){
        return await ConversationSchema.findByPk(id);
    }
    
 async getConversationByMembers(members: Array<string>) {
        return await ConversationSchema.findOne({ where: { members } });
    }
    
    public static async deleteConversation(id: string): Promise<void> {
        await ConversationSchema.destroy({ where: { id } });
    }
}
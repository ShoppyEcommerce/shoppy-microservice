import {Message,MessageModel} from "../model"


export class MessageRepository {
    async create(input:Message) {
        const message = await MessageModel.create(input)
        return message
    }

    async Find(input:Record<string, string>){
        const message = await MessageModel.findOne({where:input})
        return message
    }
    async getMessages (){
        return MessageModel.findAll()
    }
    async getConversationMessages(input:{conversationId:string}){
        return MessageModel.findAll({where:input})
    }
    async update(input:{id:string}, update:any){
        await MessageModel.update(update,{where:input})
        return "message updated"
    }
    async delete (input:{id:string}){
        await MessageModel.destroy({where:input})
        return "message deleted"
    }
}
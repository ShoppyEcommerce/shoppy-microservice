import { AdminPaymentRepository , AdminPayment} from "../../database"
import { ValidationError } from "../../utils/ErrorHandler"
import { AdminPaymentValidation, option } from "./validation"
import {v4 as uuid} from "uuid"


export class AdminPaymentService {

    private repository : AdminPaymentRepository
    constructor(){
        this.repository = new AdminPaymentRepository()
    
    }
    async create (input: AdminPayment){
        const {error, value} =  AdminPaymentValidation.validate(input, option)
        if(error){
            throw new ValidationError(error.details[0].message,"")
        }
      

        await this.repository.create(value)

        
    }
}
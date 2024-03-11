import Joi from "joi";
import { ParcelDeliveryStatus,PaymentDeliveryMethod } from "../../database";

export const ParceDeliverylValidation = Joi.object().keys({
  distance:Joi.string().required(),
  amount:Joi.number().required(),
  sender:Joi.object().keys({
    name:Joi.string().required(),
    Door:Joi.string().required(),
    address:Joi.string().required(),
    phoneNumber:Joi.string().required(),
   
  }).required(),
  receiver:Joi.object().keys({
    name:Joi.string().required(),
    Door:Joi.string().required(),
    address:Joi.string().required(),
    phoneNumber:Joi.string().required(),
  }).required(),
 parcelId:Joi.string().required(),
 whoIsPaying:Joi.string().valid("Sender","Receiver").required(),
  paymentMethod:Joi.string().valid(
    PaymentDeliveryMethod.CASH_ON_DELIVERY,
    PaymentDeliveryMethod.USER_WALLET
  ).required(),
 


});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

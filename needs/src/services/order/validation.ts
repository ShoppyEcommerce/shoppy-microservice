import Joi from "joi";
import { OrderStatus } from "../../database";

export const OrderValidationSchema = Joi.object().keys({
  cartId: Joi.string().required(),
 
  paymentType: Joi.string().required(),
  referenceId: Joi.string().optional(),
  shopId:Joi.string().required()
});
export const InitializeValidation = Joi.object().keys({
  email: Joi.string().email().required(),
  amount: Joi.number().required(),
});
export const cancelOrderValidations = Joi.object().keys({
  CancelOrderReason: Joi.string().optional(),
});
export const OrderCompletedValidation = Joi.object().keys({
  trackingCode:Joi.number().required()
})
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

export const OrderValidation = Joi.object().keys({
  status: Joi.string()
    .valid(OrderStatus.CANCELED, OrderStatus.CONFIRMED)
    .required(),
  reason: Joi.string().optional(),
});

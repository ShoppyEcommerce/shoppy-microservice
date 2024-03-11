import Joi from "joi";

export const AdminPaymentValidation = Joi.object().keys({
  amount: Joi.number().required(),
  type: Joi.string().required(),
  status:Joi.string().required(),
  orderId: Joi.string().optional(),
  parcelDeliveryId:Joi.string().required(),
  id:Joi.string().required()
  
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};


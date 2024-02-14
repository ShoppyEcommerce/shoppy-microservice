import Joi from "joi"

export const OrderValidationSchema = Joi.object().keys({
    cartId:Joi.string().required(),
    vendorId:Joi.string().required(),
    paymentType:Joi.string().required()

})
export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
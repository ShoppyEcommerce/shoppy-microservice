import Joi from "joi";

export const PaymentValidation = Joi.object().keys({
  merchant: Joi.string().required(),
  amount: Joi.number().required(),
  referenceId: Joi.string().required(),
  id:Joi.string().required(),
  userId:Joi.string().required(),
  status:Joi.string().required(),
  paymentType:Joi.string().required()
});
export const InitializeValidation = Joi.object().keys({
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
  });
export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };

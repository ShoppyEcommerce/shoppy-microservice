import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

const phoneComplexity = {
  min: 6,
  max: 6,
  requirementCount: 2,
};

export const PaymentValidation = Joi.object().keys({
  merchant: Joi.string().required(),
  amount: Joi.number().required(),
  referenceId: Joi.string().required(),
  id: Joi.string().required(),
  riderId: Joi.string().required(),
  status: Joi.string().required(),
  paymentType: Joi.string().required(),
  type:Joi.string().required()
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
export const CreateRecipientValidation = Joi.object().keys({
  type: Joi.string().required(),
  account_number: Joi.number().required(),
  bank_code: Joi.string().required(),
  currency: Joi.string().required(),
  name:Joi.string().required()
});
export const TransferValidation = Joi.object().keys({
  pin:PasswordComplexity(phoneComplexity).required(),
  amount:Joi.number().required()
})

export const verifyAccountValidation = Joi.object().keys({
  account_number: Joi.number().required(),
  bank_code: Joi.number().required(),
 
})

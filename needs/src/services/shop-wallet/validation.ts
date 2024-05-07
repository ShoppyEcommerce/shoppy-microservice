import Joi from "joi"
import PasswordComplexity from "joi-password-complexity";

const phoneComplexity = {
  min: 6,
  max: 6,
  requirementCount: 2,
};

export const pinValidation = Joi.object().keys({
    pin:PasswordComplexity(phoneComplexity).required()
})
export  const ChangePinValidation =  Joi.object().keys({
  oldPin:PasswordComplexity(phoneComplexity).required(),
  newPin:PasswordComplexity(phoneComplexity).required()
})

export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
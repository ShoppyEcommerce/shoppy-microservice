import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

const complexityOptions = {
  min: 8,
  max: 30,
  symbol: 1,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  requirementCount: 6,
};
const phoneComplexity = {
  min: 11,
  max: 11,
  requirementCount: 2,
};

//Registration validation
export const registerUserSchema = Joi.object().keys({
  email: Joi.string().trim().lowercase().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: PasswordComplexity(complexityOptions).required(),
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({ "any.only": "{{#label}} does not match" }),
  phone: PasswordComplexity(phoneComplexity).required(),
  id: Joi.string().required(),
  referral: Joi.string().optional(),
});
export const loginUserSchema = Joi.object().keys({
  phone: PasswordComplexity(phoneComplexity).required(),
  password: PasswordComplexity(complexityOptions).required(),
});
//VERIFYOTP
export const verifyOTPSchema = Joi.object().keys({
  phone: PasswordComplexity(phoneComplexity).required(),
  OTP: Joi.number().required(),
});
export const ResetPasswordValidation = Joi.object().keys({
  OTP: Joi.number().required(),
  phone: PasswordComplexity(phoneComplexity).required(),
  password: PasswordComplexity(complexityOptions).required(),
});
export const ChangePasswordValidation = Joi.object().keys({
  phone: PasswordComplexity(phoneComplexity).required(),
  oldPassword: PasswordComplexity(complexityOptions).required(),
  newPassword: PasswordComplexity(complexityOptions).required(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

export const DeleteValidate = Joi.object().keys({
  password: PasswordComplexity(complexityOptions).required(),
  reason: Joi.string().required(),
});

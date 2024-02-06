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
export const registerVendorSchema = Joi.object().keys({
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
  });
  export const loginVendorSchema = Joi.object().keys({
    phone: PasswordComplexity(phoneComplexity).required(),
  });
  export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
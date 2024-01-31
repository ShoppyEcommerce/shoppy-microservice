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
//PRODUCT SCHEMA
export const ProductSchema = Joi.object().keys({
  name: Joi.string().required(),
  id: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  description: Joi.string().required(),
  categoryId: Joi.string().required(),
  images: Joi.array().items(Joi.string()).required(),
});
//Update product Schema
export const UpdateProductSchema = Joi.object().keys({
  name: Joi.string(),
  price: Joi.number(),
  quantity: Joi.number(),
  description: Joi.string(),
  categoryId: Joi.string(),
  images: Joi.array().items(Joi.string()),
});

//Update OrderSchema

export const updateOrderSchema = Joi.object().keys({
  status: Joi.string(),
  deliveryMan: Joi.string(),
});

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

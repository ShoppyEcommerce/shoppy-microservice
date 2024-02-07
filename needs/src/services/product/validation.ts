import Joi from "joi";
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
//closes product

export const ClosestProductSchema = Joi.object().keys({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

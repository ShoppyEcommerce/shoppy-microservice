import Joi from "joi";
//PRODUCT SCHEMA
export const ProductSchema = Joi.object().keys({
  itemName: Joi.string().required(),
  unit: Joi.string().required(),
  discountType: Joi.string().optional(),
  id: Joi.string().required(),
  price: Joi.number().required(),
  discount: Joi.number().optional(),
  totalStock: Joi.number().required(),
  Description: Joi.string().required(),
  categoryId: Joi.string().required(),
  ItemImages: Joi.array().items(Joi.string()).required(),
  Attribute: Joi.array().items(Joi.string()).required(),
  Tag: Joi.string().optional(),
  Vat: Joi.string().required(),
});

//Update product Schema
export const UpdateProductSchema = Joi.object().keys({
  itemName: Joi.string().optional(),
  price: Joi.number().optional(),
  totalStock: Joi.number().optional(),
  Description: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  ItemImages: Joi.array().items(Joi.string()).optional(),
  discountType: Joi.string().optional(),
  Attribute: Joi.array().items(Joi.string()).optional(),
  Tag: Joi.string().optional(),
  unit: Joi.string().optional(),

});
//closes product

export const ClosestProductSchema = Joi.object().keys({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});
export const toggleProductSchema = Joi.object().keys({
  active: Joi.boolean().required(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

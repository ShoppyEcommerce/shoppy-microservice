import Joi from "joi";

export const CartValidationSchema = Joi.object().keys({
  shopId: Joi.string().required(),
  products: Joi.object()
    .keys({
      id: Joi.string().required(),
      itemName: Joi.string().required(),
      Qty: Joi.number().required(),
      amount: Joi.number().required(),
    })
    .required(), // Make the entire products array required
  totalAmount: Joi.number().required(), // Add parentheses for required
});

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

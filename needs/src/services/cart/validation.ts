import Joi from "joi";

export const CartValidationSchema = Joi.object().keys({
  vendor: Joi.string().required(),
  products: Joi.array()
    .items({
      id: Joi.string().required(),
      name: Joi.string().required(),
      quantity: Joi.number().required(),
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

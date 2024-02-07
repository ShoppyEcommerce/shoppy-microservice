import Joi from "joi";

export const LikeValidationSchema = Joi.object().keys({
  productId: Joi.string().required(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};
import Joi from "joi";

export const RatingValidation = Joi.object().keys({
  rating: Joi.number().required(),
  productId: Joi.string().required(),
  comment: Joi.string().optional(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

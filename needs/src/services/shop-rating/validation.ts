import Joi from "joi";

export const ShopRatingValidation = Joi.object().keys({
  rating: Joi.number().required(),
  shopId: Joi.string().required(),
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

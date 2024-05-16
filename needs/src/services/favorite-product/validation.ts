import Joi from "joi"


export const FavoriteProductValidation = Joi.object().keys({
productId:Joi.string().required()
})
export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
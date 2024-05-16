import Joi from "joi"


export const FavoriteStoreValidation = Joi.object().keys({
shopId:Joi.string().required()
})
export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
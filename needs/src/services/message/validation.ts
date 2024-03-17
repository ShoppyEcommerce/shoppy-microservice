import Joi from "joi"


export const messageValidation = Joi.object().keys({
    text:Joi.string().required(),
    conversationId:Joi.string().required(),
    sender:Joi.string().required(),
    image:Joi.string().optional()

})
export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
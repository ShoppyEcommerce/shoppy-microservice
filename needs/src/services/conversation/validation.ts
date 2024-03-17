import Joi from "joi";

export const conversationValidation = Joi.object().keys({
 receiverId:Joi.string().required(),
});

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

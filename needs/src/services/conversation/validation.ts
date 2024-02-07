import Joi from "joi";

export const conversationValidation = Joi.object().keys({
  members: Joi.array().items(Joi.string()).required(),
});

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

import Joi from "joi";

export const ParcelValidation = Joi.object().keys({
   name:Joi.string().required(),
   image:Joi.string().required(),
   moduleId:Joi.string().required()
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

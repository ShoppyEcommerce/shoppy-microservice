import Joi from "joi";

export const profileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  logo: Joi.string().required(),
  location: Joi.string().required(),
});
export const UpdateprofileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  logo: Joi.string().optional(),
  location: Joi.string().optional(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

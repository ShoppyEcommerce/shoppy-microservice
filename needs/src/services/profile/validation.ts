
import Joi from "joi"
export const profileSchema = Joi.object().keys({
    image: Joi.string().optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  
    location: Joi.string().required(),
  });
  export const UpdateProfileSchema = Joi.object().keys({
    image: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
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
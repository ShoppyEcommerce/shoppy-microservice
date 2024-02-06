import Joi from "joi"

export const CategorySchema = Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().required(),
    moduleId: Joi.string().required(),
  });
  export const UpdateCategorySchema = Joi.object().keys({
    name: Joi.string().optional(),
    image: Joi.string().optional(),
    moduleId: Joi.string().optional(),
  });
  export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
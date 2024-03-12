import Joi from "joi";
//module
export const ModuleSchema = Joi.object().keys({
  name: Joi.string().required(),
  image: Joi.string().required(),
  caption: Joi.string().required(),
});
export const UpdateModuleSchema = Joi.object().keys({
  name: Joi.string().optional(),
  image: Joi.string().optional(),
  caption: Joi.string().optional(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

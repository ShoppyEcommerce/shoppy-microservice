import Joi from "joi";

export const ServiceValidation = Joi.object().keys({
    categoryId:Joi.string().required(),
    description:Joi.string().required(),
    catalogue:Joi.array().items({
        name:Joi.string().required(),
        image:Joi.string().required()
    }).required(),
    name:Joi.string().required(),
    latitude:Joi.number().required(),
    longitude:Joi.number().required(),
    location:Joi.string().required(),
    logo:Joi.string().required(),
    image:Joi.string().required()
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

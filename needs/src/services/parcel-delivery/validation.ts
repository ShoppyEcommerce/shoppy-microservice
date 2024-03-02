import Joi from "joi";

export const ParceDeliverylValidation = Joi.object().keys({
  distance:Joi.string().required(),
  amount:Joi.number().required(),
  sender:Joi.object().keys({
    name:Joi.string().required(),
    email:Joi.string().email().required(),
    phone:Joi.string().required(),
    address:Joi.string().required(),
  }).required(),
  receiver:Joi.object().keys({
    name:Joi.string().required(),
    email:Joi.string().email().required(),
    phone:Joi.string().required(),
    address:Joi.string().required(),
  }).required(),
 parcelId:Joi.string().required()

});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

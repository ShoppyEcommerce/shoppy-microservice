import Joi from "joi";

export const validateAddress = Joi.object().keys({
  deliveryAddress: Joi.string().required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  houseNumber: Joi.string().required(),
  floorNumber: Joi.string().required(),
  doorNumber: Joi.string().required(),
});

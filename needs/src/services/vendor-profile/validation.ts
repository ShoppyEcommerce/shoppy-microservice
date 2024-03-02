import Joi from "joi";

export const profileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  logo: Joi.string().required(),
  location: Joi.string().required(),
  bankName: Joi.string().optional(),
  accountHolder: Joi.string().optional(),
  accountNumber: Joi.string().length(10).optional(),
  recipient:Joi.string().optional()
});
export const UpdateprofileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  logo: Joi.string().optional(),
  location: Joi.string().optional(),
});
export const UpdateBankDetails = Joi.object().keys({
  bankName: Joi.string().required(),
  accountHolder: Joi.string().required(),
  accountNumber: Joi.string().length(10).required(),
  recipient:Joi.string().required()
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

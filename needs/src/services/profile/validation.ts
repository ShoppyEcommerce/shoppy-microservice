import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
const phoneComplexity = {
  min: 11,
  max: 11,
  requirementCount: 2,
};
export const profileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  bankName: Joi.string().optional(),
  accountName: Joi.string().optional(),
  accountNumber: Joi.string().optional(),
  location: Joi.string().required(),
  deliveryAddress: Joi.array().items(Joi.string().optional()).optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
});
export const UpdateProfileSchema = Joi.object().keys({
  image: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  location: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  deliveryAddress: Joi.array().items(Joi.string().optional()).optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: PasswordComplexity(phoneComplexity).optional(),
});
export const UpdateBankDetails = Joi.object().keys({
  bankName: Joi.string().required(),
  accountName: Joi.string().required(),
  accountNumber: Joi.string().required(),
  recipient: Joi.string().required(),
});

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

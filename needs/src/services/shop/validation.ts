import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

const complexityOptions = {
  min: 8,
  max: 30,
  symbol: 1,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  requirementCount: 6,
};
const phoneComplexity = {
  min: 11,
  max: 11,
  requirementCount: 2,
};
//Registration validation
export const registerShopValidation = Joi.object().keys({
  email: Joi.string().trim().lowercase().email().required(),

  phoneNumber: PasswordComplexity(phoneComplexity).required(),
});
export const loginShopValidation = Joi.object().keys({
  phoneNumber: PasswordComplexity(phoneComplexity).required(),
});
export const VerifyOtpValidation = Joi.object().keys({
  OTP: Joi.number().required(),
  phoneNumber: PasswordComplexity(phoneComplexity).required(),
});
export const ResetPasswordValidation = Joi.object().keys({
  OTP: Joi.number().required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: PasswordComplexity(complexityOptions).required(),
});
export const ChangePasswordValidation = Joi.object().keys({
  email: Joi.string().trim().lowercase().email().required(),
  oldPassword: PasswordComplexity(complexityOptions).required(),
  newPassword: PasswordComplexity(complexityOptions).required(),
});
export const ShopDetailsValidation = Joi.object().keys({
  logo: Joi.string().required(),
  storeName: Joi.string().required(),
  contactNumber: Joi.string().required(),
  Address: Joi.string().required(),
  Banner: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});
export const ShopScheduleValidation = Joi.object().keys({
  Sunday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Monday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Tuesday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Wednesday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Thursday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Friday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
  Saturday: Joi.object()
    .keys({
      openingTime: Joi.string().optional(),
      closingTime: Joi.string().optional(),
    })
    .optional(),
});
export const DeliverySettingValidation = Joi.object().keys({
  scheduleOrder: Joi.boolean().optional(),
  Delivery: Joi.boolean().optional(),
  TakeAway: Joi.boolean().optional(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

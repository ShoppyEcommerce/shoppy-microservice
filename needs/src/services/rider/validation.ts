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
export const registerRiderSchema = Joi.object().keys({
  email: Joi.string().trim().lowercase().email().required(),

  phoneNumber: PasswordComplexity(phoneComplexity).required(),
});

export const loginRiderSchema = Joi.object().keys({
  phoneNumber: PasswordComplexity(phoneComplexity).required(),
});
export const verifyOTPSchema = Joi.object().keys({
  phoneNumber: Joi.string().required(),
  OTP: Joi.number().required(),
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

export const updatePersonalInformationValidation = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  referalCode: Joi.string().optional(),
});
export const updateVehicleDetailValidation = Joi.object().keys({
  vehicleType: Joi.string().required(),
  vehicleColor: Joi.string().required(),
  vehicleManufacturer: Joi.string().required(),
  vehicleLicensePlate: Joi.string().required(),
});

export const updateLegalLicenseDetail = Joi.object().keys({
  driverLicenseNumber: Joi.string().optional(),
  birthDay: Joi.object()
    .keys({
      year: Joi.string().required(),
      month: Joi.string().required(),
      day: Joi.string().required(),
    })
    .required(),
  identificationNumber: Joi.string().required(),
});
export const updateDocumentetailValidation = Joi.object().keys({
  profilePhoto: Joi.string().required(),
  nationalIdCardFront: Joi.object().keys({
    image: Joi.string().required(),
    expiryDate: Joi.object()
      .keys({
        year: Joi.string().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
      })
      .required(),
  }),
  nationalIdCardBack: Joi.object().keys({
    image: Joi.string().required(),
    expiryDate: Joi.object()
      .keys({
        year: Joi.string().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
      })
      .required(),
  }),
  driverLicenseBack: Joi.object().keys({
    image: Joi.string().required(),
    expiryDate: Joi.object()
      .keys({
        year: Joi.string().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
      })
      .required(),
  }),
  driverLicenseFront: Joi.object().keys({
    image: Joi.string().required(),
    expiryDate: Joi.object()
      .keys({
        year: Joi.string().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
      })
      .required(),
  }),
  transportOperatorLicense: Joi.object().keys({
    image: Joi.string().required(),
    expiryDate: Joi.object()
      .keys({
        year: Joi.string().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
      })
      .required(),
  }),
});

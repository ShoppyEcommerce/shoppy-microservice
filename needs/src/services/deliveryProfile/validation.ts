import Joi from "joi";
const modeOfIdentificationValues = [
  "National_Id",
  "Voters_Card",
  "Drivers_License",
  "International_Passport",
];

export const DeliveryProfileValidation = Joi.object().keys({
  profilePicture: Joi.string().required(),
  motorcycleImage: Joi.string().required(),
  plateNumber: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  modeOfIdentification: Joi.string()
    .valid(...modeOfIdentificationValues)
    .required(),
  identityNumber: Joi.string().required(),
  location:Joi.string().required()
});
export const UpdateDeliveryProfileValidation = Joi.object().keys({
  profilePicture: Joi.string().optional(),
  motorcycleImage: Joi.string().optional(),
  plateNumber: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  location:Joi.string().optional()
});
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

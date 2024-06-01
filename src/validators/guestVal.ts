import Joi from "joi";

export const newGuestValidator = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  nationalID: Joi.number().required(),
  nationality: Joi.string().required(),
  countryFlag: Joi.string(),
});

export const guestIdSchema = Joi.object({
  $oid: Joi.string().required(),
});

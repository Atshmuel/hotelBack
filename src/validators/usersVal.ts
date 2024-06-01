import Joi from "joi";

export const newUserValidation = Joi.object({
  createdAt: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  password: Joi.string().required(),
  lastPasswordChang: Joi.string(),
  role: Joi.string().required(),
});

export const updateUserPassword = Joi.object({
  password: Joi.string().required(),
  lastPasswordChang: Joi.string(),
});

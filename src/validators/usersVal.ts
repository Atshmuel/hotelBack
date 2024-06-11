import Joi from "joi";
import { idSchema } from "./globalValidation";

export const newUserValidation = Joi.object({
  createdAt: Joi.string(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  password: Joi.string().min(9).required(),
  passwordConfirm: Joi.string().min(9).required(),
  userAvatar: Joi.string().min(0),
  userRole: Joi.string().required(),
});


export const updateUserPasswordValidation = Joi.object({
  newPassword: Joi.alternatives().try(Joi.string().min(9), Joi.number().min(9)).required(),
  oldPassword: Joi.alternatives().try(Joi.string().min(9), Joi.number().min(9)).required(),
});
export const updateUserRoleValidator = Joi.object({
  role: Joi.string().required(),
  id: idSchema,
});

export const updateUserInfo = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  phone: Joi.string().length(10).required(),
  userAvatar: Joi.string(),
});

export const loginInfo = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(9).required(),
});


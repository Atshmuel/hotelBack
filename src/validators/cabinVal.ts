import Joi from "joi";

export const newCabinValidator = Joi.object({
  createdAt: Joi.string().optional(),
  name: Joi.string().required(),
  maxCapacity: Joi.number().required(),
  regularPrice: Joi.number().required(),
  discount: Joi.number(),
  description: Joi.string().required(),
  imgsUrl: Joi.array().items(Joi.string()).required(),
});

export const newCabinDataValidator = Joi.object({
  createdAt: Joi.string().required(),
  name: Joi.string().required(),
  maxCapacity: Joi.number().required(),
  regularPrice: Joi.number().required(),
  discount: Joi.number(),
  description: Joi.string().required(),
  imgsUrl: Joi.array().items(Joi.string()).required(),
  __v: Joi.number().optional(),
  lastUpdate: Joi.string().optional(),
});


export const cabinIdSchema = Joi.object({
  $oid: Joi.string().length(24).required(),
});

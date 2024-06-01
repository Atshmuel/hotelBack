import Joi from "joi";

export const newCabinValidator = Joi.object({
  name: Joi.string().required(),
  maxCapacity: Joi.number().required(),
  regularPrice: Joi.number().required(),
  discount: Joi.number(),
  description: Joi.string().required(),
  imgUrl: Joi.string().required(),
});

export const cabinIdSchema = Joi.object({
  $oid: Joi.string().length(24).required(),
});

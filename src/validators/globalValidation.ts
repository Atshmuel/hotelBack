import Joi from "joi";
export const idSchema = Joi.string().length(24).required();

import Joi, { optional } from "joi";
import { cabinIdSchema } from "./cabinVal";
import { guestIdSchema } from "./guestVal";

export const bookingIdSchema = Joi.object({
  $oid: Joi.string().required(),
});

export const newBookingValidator = Joi.object({
  createdAt: Joi.string(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  numNights: Joi.number().integer().positive().required(),
  numGuests: Joi.number().integer().positive().required(),
  cabinPrice: Joi.number().positive().required(),
  extrasPrice: Joi.number().greater(-1).required(),
  totalPrice: Joi.number().positive().required(),
  hasBreakfast: Joi.boolean().required(),
  isPaid: Joi.boolean().required(),
  observations: Joi.optional(),
  status: Joi.string().required(),
  cabinID: Joi.string().length(24).required() || cabinIdSchema.required(),
  guestID: Joi.string().length(24).required() || guestIdSchema.required(),
  sId: Joi.string().optional()
});
export const bookingUpdateValidator = Joi.object({
  extrasPrice: Joi.number().positive().optional(),
  totalPrice: Joi.number().positive().optional(),
  hasBreakfast: Joi.boolean().optional(),
  isPaid: Joi.boolean().optional(),
  status: Joi.string().required(),
});


export const bookingFromDateValitaor = Joi.object({
  last: Joi.string().required(),
  fields: Joi.string().required(),
});

import Joi from "joi";
import { cabinIdSchema } from "./cabinVal";
import { guestIdSchema } from "./guestVal";

export const bookingIdSchema = Joi.object({
  $oid: Joi.string().required(),
});

export const newBookingValidator = Joi.object({
  createdAt: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  numNights: Joi.number().integer().positive().required(),
  numGuests: Joi.number().integer().positive().required(),
  cabinPrice: Joi.number().positive().required(),
  extrasPrice: Joi.number().positive().required(),
  totalPrice: Joi.number().positive().required(),
  hasBreakfast: Joi.boolean().required(),
  isPaid: Joi.boolean().required(),
  observations: Joi.string().required(),
  status: Joi.string().required(),
  cabinID: cabinIdSchema.required(),
  guestID: guestIdSchema.required(),
});
export const bookingUpdateValidator = Joi.object({
  extrasPrice: Joi.number().positive().optional(),
  totalPrice: Joi.number().positive().optional(),
  hasBreakfast: Joi.boolean().optional(),
  isPaid: Joi.boolean().required(),
  status: Joi.string().required(),
});


export const bookingFromDateValitaor = Joi.object({
  last: Joi.string().required(),
  fields: Joi.string().required(),
});

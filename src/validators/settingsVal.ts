import Joi from "joi";

export const settingsValidation = Joi.object({
  minBookingLen: Joi.number().optional(),
  maxBookingLen: Joi.number().optional(),
  maxGuests: Joi.number().optional(),
  breakfastPrice: Joi.number().optional(),
});

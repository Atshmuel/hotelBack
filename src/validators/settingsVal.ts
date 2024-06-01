import Joi from "joi";

export const settingsValidation = Joi.object({
  minBookingLen: Joi.number(),
  maxBookingLen: Joi.number(),
  maxGuests: Joi.number(),
  breakfastPrice: Joi.number(),
});

import mongoose, { Schema } from "mongoose";
import { Bookings } from "../interfaces/interfaces";

export const bookingSchema = new mongoose.Schema<Bookings>({
  createdAt: Date,
  startDate: Date,
  endDate: Date,
  numNights: Number,
  numGuests: Number,
  cabinPrice: Number,
  extrasPrice: Number,
  totalPrice: Number,
  hasBreakfast: Boolean,
  isPaid: Boolean,
  observations: String,
  status: String,
  cabinID: Schema.Types.ObjectId,
  guestID: Schema.Types.ObjectId,
});

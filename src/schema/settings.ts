import mongoose from "mongoose";
import { Settings } from "../interfaces/interfaces";

export const settingsSchema = new mongoose.Schema<Settings>({
  createdAt: Date,
  minBookingLen: Number,
  maxBookingLen: Number,
  maxGuests: Number,
  breakfastPrice: Number,
});

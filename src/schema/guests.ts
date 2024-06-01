import mongoose from "mongoose";
import { Guests } from "../interfaces/interfaces";

export const guestSchema = new mongoose.Schema<Guests>({
  createdAt: Date,
  fullName: String,
  email: String,
  nationalID: Number,
  nationality: String,
  countryFlag: String,
});

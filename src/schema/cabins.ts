import mongoose from "mongoose";
import { Cabins } from "../interfaces/interfaces";

export const cabinSchema = new mongoose.Schema<Cabins>({
  createdAt: Date,
  name: String,
  maxCapacity: Number,
  regularPrice: Number,
  discount: Number,
  description: String,
  imgsUrl: [String],
  lastUpdate: Date,
});

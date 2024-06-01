import mongoose from "mongoose";
import { Users } from "../interfaces/interfaces";

export const userSchema = new mongoose.Schema<Users>({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  userAvatar: String,
  createdAt: Date,
  lastPasswordChange: Date,
  refreshToken: [String],
});

import mongoose from "mongoose";
import { bookingSchema } from "../../schema/bookings";
import { guestSchema } from "../../schema/guests";
import { cabinSchema } from "../../schema/cabins";
import { settingsSchema } from "../../schema/settings";
import { userSchema } from "../../schema/users";

export const bookingModel = mongoose.model("booking", bookingSchema);
export const guestModel = mongoose.model("guest", guestSchema);
export const cabinModel = mongoose.model("cabin", cabinSchema);
export const settingsModel = mongoose.model("settings", settingsSchema);
export const userModel = mongoose.model("users", userSchema);

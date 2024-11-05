import { ObjectId } from "mongoose";
import { guestModel } from "../models/models";
import { Guests } from "../../interfaces/interfaces";

export const getGuest = async (id: ObjectId) => {
  return await guestModel.findById(id);
};

export const createGuset = async (fullName: string, email: string) => {
  const guest = await guestModel.create({ fullName, email, nationalID: "", nationality: undefined, countryFlag: undefined })
  return guest
}

export const updateGuest = async (nationalID: number, nationality: string, flag: string, id: string): Promise<boolean> => {
  const guest = await guestModel.findByIdAndUpdate(id, { nationalID, countryFlag: flag, nationality })
  return guest ? true : false
}

export const guestByEmail = async (email: string) => {
  if (!email) return
  const guest = await guestModel.findOne({ email: email.toLowerCase() });

  return guest;
};
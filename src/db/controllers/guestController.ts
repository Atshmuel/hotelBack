import { ObjectId } from "mongoose";
import { guestModel } from "../models/models";

export const getGuest = async (id: ObjectId) => {
  return await guestModel.findById(id);
};

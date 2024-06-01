import { Guests, ID } from "../../interfaces/interfaces";
import { guestModel } from "../models/models";

export const getGuest = async (id: ID) => {
  return await guestModel.findById(id);
};

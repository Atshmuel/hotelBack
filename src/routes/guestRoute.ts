import { Router } from "express";
import { idSchema } from "../validators/globalValidation";
import { getGuest } from "../db/controllers/guestController";
import { ObjectId } from "mongoose";
export const guestRouter = Router();

guestRouter.get("/", async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const guestData = await getGuest(id);
    if (!guestData) throw new Error(`Failed to find this guest ID (${id})`);
    res.status(200).json(guestData);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

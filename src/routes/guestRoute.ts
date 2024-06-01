import { Router } from "express";
import { idSchema } from "../validators/globalValidation";
import { getGuest } from "../db/controllers/guestController";
export const guestRouter = Router();

guestRouter.get("/", async (req, res) => {
  const { id } = req.query;
  const { error } = idSchema.validate(id);
  try {
    if (error) throw new Error(`${error?.message}`);
    const guestData = await getGuest(id);
    if (!guestData) throw new Error(`Failed to find this guest ID (${id})`);
    res.status(200).json(guestData);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

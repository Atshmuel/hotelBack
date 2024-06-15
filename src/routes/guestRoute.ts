import { Router } from "express";
import { idSchema } from "../validators/globalValidation";
import { getGuest } from "../db/controllers/guestController";
import { ObjectId } from "mongoose";
import { config } from "../config/config";
import { CustomRequest } from "../interfaces/interfaces";
import { writeToFile } from "../services/fs";
import { getUserInfo } from "../middlewares/authHelpers";
export const guestRouter = Router();

guestRouter.get("/", getUserInfo, async (req: CustomRequest, res) => {
  const { userId } = req.user;
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const guestData = await getGuest(id);
    if (!guestData) throw new Error(`Failed to find this guest ID (${id})`);
    writeToFile(
      config.LOGS_FILE,
      `Guest ${id} has been requested by user ${userId}`
    );
    res.status(200).json(guestData);
  } catch (error) {
    writeToFile(
      config.LOGS_FILE,
      `${error} while tring to get guest ${id} info by user ${userId}`
    );

    res.status(400).json({ error: error?.message });
  }
});

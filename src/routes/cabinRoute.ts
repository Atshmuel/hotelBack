import { Router } from "express";
import {
  createCabin,
  deleteCabin,
  editCabinData,
  getCabin,
  getCabins,
} from "../db/controllers/cabinController";
import { idSchema } from "../validators/globalValidation";
import { newCabinDataValidator, newCabinValidator } from "../validators/cabinVal";
import { authRole, authenticateToken } from "../middlewares/authHelpers";
import { ObjectId } from "mongoose";
import { config } from "../config/config";
import { limiter } from "../services/helpers";
export const cabinRouter = Router();

cabinRouter.get("/", async (req, res) => {
  try {
    const cabinsData: {
      hasFound: boolean;
      message: string;
      cabinsArr: Object[];
    } = await getCabins();
    if (!cabinsData.hasFound) throw new Error(`${cabinsData?.message}`);
    return res.status(200).json(cabinsData?.cabinsArr);
  } catch (error: any) {
    return res.status(500).json(error?.message);
  }
});

cabinRouter.get("/byID", async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const cabinData = await getCabin(id);
    if (!cabinData) throw new Error(`Failed to find this cabin ID (${id})`);
    res.status(200).json(cabinData);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.delete("/", authRole([config.ROLE.OWNER]), authenticateToken, async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const hasBeenDeleted = await deleteCabin(id);
    if (!hasBeenDeleted)
      throw new Error("Cloud not delete the cabin, Please try again later.");
    res.status(200).json({ message: "Cabin has been delete successfully." });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.post("/", authRole([config.ROLE.ADMIN]), authenticateToken, limiter(60, 1), async (req, res) => {
  const newCabin = req.body;
  const { error } = newCabinValidator.validate(newCabin);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const { hasCreated, message } = await createCabin(newCabin);
    if (!hasCreated) throw new Error(message);
    res.status(201).json({ message: message });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.patch("/", authRole([config.ROLE.ADMIN]), authenticateToken, async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;
  const newData = req.body;
  const { error: idError } = idSchema.validate(id);
  const { error: dataError } = newCabinDataValidator.validate(newData);
  if (idError || dataError) {
    return res.status(400).json({ message: idError?.message || dataError?.message });
  }

  try {
    const { hasUpdated, message: updateMessage } = (await editCabinData(
      id,
      newData
    )) as {
      hasUpdated: boolean;
      message: string;
    };

    if (!hasUpdated) throw new Error(`${updateMessage}`);
    res.status(200).json({ message: `${updateMessage}` });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

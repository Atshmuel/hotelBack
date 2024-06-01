import { Router } from "express";
import {
  createCabin,
  deleteCabin,
  editCabinData,
  getCabin,
  getCabins,
} from "../db/controllers/cabinController";
import { idSchema } from "../validators/globalValidation";
import { newCabinValidator } from "../validators/cabinVal";
import { authenticateToken } from "../middlewares/authHelpers";
import { ObjectId } from "mongoose";
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
  try {
    if (error) throw new Error(`${error?.message}`);
    const cabinData = await getCabin(id);
    if (!cabinData) throw new Error(`Failed to find this cabin ID (${id})`);
    res.status(200).json(cabinData);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.delete("/", authenticateToken, async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);

  try {
    if (error) {
      throw new Error(`${error?.message}`);
    }
    const hasBeenDeleted = await deleteCabin(id);
    if (!hasBeenDeleted)
      throw new Error("Cloud not delete the cabin, Please try again later.");
    res.status(200).json({ message: "Cabin has been delete successfully." });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.post("/", authenticateToken, async (req, res) => {
  const newCabin = req.body;
  const { error } = newCabinValidator.validate(newCabin);
  try {
    if (error) throw new Error(`${error?.message}`);
    const { hasCreated, message } = await createCabin(newCabin);
    if (!hasCreated) throw new Error(message);
    res.status(201).json({ message: message });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.patch("/", authenticateToken, async (req, res) => {
  const { id }: { id?: ObjectId } = req.query;

  const newData = req.body;
  const { error } = idSchema.validate(id);

  try {
    if (error) throw new Error(`${error?.message}`);

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

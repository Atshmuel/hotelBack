import { Router } from "express";
import {
  createCabin,
  deleteCabin,
  editCabinData,
  getCabin,
  getCabins,
} from "../db/controllers/cabinController";
import { idSchema } from "../validators/globalValidation";
import {
  newCabinDataValidator,
  newCabinValidator,
} from "../validators/cabinVal";
import { authRole, getUserInfo } from "../middlewares/authHelpers";
import { ObjectId } from "mongoose";
import { config } from "../config/config";
import { limiter } from "../services/helpers";
import { Cabins, CustomRequest, newCabinInt } from "../interfaces/interfaces";
import { writeToFile } from "../services/fs";
export const cabinRouter = Router();

cabinRouter.get("/", getUserInfo, async (req: CustomRequest, res) => {
  const { userId } = req.user;
  try {
    const cabinsData: {
      hasFound: boolean;
      message: string;
      cabinsArr: Object[];
    } = await getCabins();
    if (!cabinsData.hasFound) throw new Error(`${cabinsData?.message}`);
    writeToFile(config.LOGS_FILE, `Found cabins data according to ${userId}.`);
    return res.status(200).json(cabinsData?.cabinsArr);
  } catch (error: any) {
    writeToFile(
      config.LOGS_FILE,
      `${error} when cabins data requested by user ${userId}.`
    );
    return res.status(400).json(error?.message);
  }
});

cabinRouter.get("/byID", getUserInfo, async (req: CustomRequest, res) => {
  const { userId } = req.user;
  const { id }: { id?: ObjectId } = req.query;
  const { error } = idSchema.validate(id);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const cabinData = await getCabin(id);
    if (!cabinData) throw new Error(`Failed to find this cabin ID (${id})`);
    writeToFile(
      config.LOGS_FILE,
      `Cabin ${id} data requested by user ${userId}.`
    );
    res.status(200).json(cabinData);
  } catch (error) {
    writeToFile(
      config.LOGS_FILE,
      `${error} when cabin ${id} data requested by user ${userId}.`
    );
    res.status(400).json({ error: error?.message });
  }
});

cabinRouter.delete(
  "/",
  getUserInfo,
  authRole([config.ROLE.OWNER]),
  async (req: CustomRequest, res) => {
    const { userId } = req.user;
    const { id }: { id?: ObjectId } = req.query;
    const { error } = idSchema.validate(id);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    try {
      const hasBeenDeleted = await deleteCabin(id);
      if (!hasBeenDeleted)
        throw new Error("Cloud not delete the cabin, Please try again later.");
      writeToFile(config.LOGS_FILE, `Cabin ${id} deleted by user ${userId}.`);
      res.status(200).json({ message: "Cabin has been delete successfully." });
    } catch (error) {
      writeToFile(
        config.LOGS_FILE,
        `${error} while tring to delete cabin ${id} by user ${userId}.`
      );
      res.status(400).json({ error: error?.message });
    }
  }
);

cabinRouter.post(
  "/",
  getUserInfo,
  authRole([config.ROLE.OWNER, config.ROLE.ADMIN]),
  limiter(60, 1),
  async (req: CustomRequest, res) => {
    const { userId } = req.user;
    const { error } = newCabinValidator.validate(req.body);
    const newCabin = req.body as newCabinInt;
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    try {
      const { hasCreated, message } = await createCabin(newCabin);
      if (!hasCreated) throw new Error(message);
      writeToFile(
        config.LOGS_FILE,
        `Cabin ${newCabin.name} has been created by user ${userId}.`
      );
      res.status(201).json({ message: message });
    } catch (error) {
      writeToFile(
        config.LOGS_FILE,
        `${error} while tring to create new cabin by user ${userId}.`
      );
      res.status(400).json({ error: error?.message });
    }
  }
);

cabinRouter.patch(
  "/",
  getUserInfo,
  authRole([config.ROLE.OWNER]),
  async (req: CustomRequest, res) => {
    const { userId } = req.user;
    const { id }: { id?: ObjectId } = req.query;
    const { error: idError } = idSchema.validate(id);
    const { error: dataError } = newCabinDataValidator.validate(req.body);
    if (idError || dataError) {
      return res
        .status(400)
        .json({ message: idError?.message || dataError?.message });
    }
    const newData = req.body as Cabins;
    try {
      const { hasUpdated, message: updateMessage } = (await editCabinData(
        id,
        newData
      )) as {
        hasUpdated: boolean;
        message: string;
      };

      if (!hasUpdated) throw new Error(`${updateMessage}`);
      writeToFile(
        config.LOGS_FILE,
        `Cabin ${id} has been updated by user ${userId}
        New Data:
        Name: ${newData.name ? newData.name : ""}
        Capacity: ${
          newData.maxCapacity ? newData.maxCapacity : "Hasn't Changed"
        }
        Price: ${newData.regularPrice ? newData.regularPrice : "Hasn't Changed"}
        Discount: ${newData.discount ? newData.discount : "Hasn't Changed"}
        Description: ${
          newData.description ? newData.description : "Hasn't Changed"
        }
        Img URL: ${newData.imgUrl ? newData.imgUrl : "Hasn't Changed"}`
      );
      res.status(200).json({ message: `${updateMessage}` });
    } catch (error) {
      writeToFile(
        config.LOGS_FILE,
        `${error} while tring to update cabin ${id} by user ${userId}.`
      );
      res.status(400).json({ error: error?.message });
    }
  }
);

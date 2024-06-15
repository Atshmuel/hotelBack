import { Router } from "express";
import {
  getSettings,
  updateSetting,
} from "../db/controllers/settingController";
import { authRole, getUserInfo } from "../middlewares/authHelpers";
import { config } from "../config/config";
import { CustomRequest, Settings } from "../interfaces/interfaces";
import { writeToFile } from "../services/fs";
export const settingsRoute = Router();

settingsRoute.get("/", getUserInfo, async (req: CustomRequest, res) => {
  const { userId } = req.user;
  try {
    const settingData: {
      hasFound: boolean;
      message: string;
      settings: object;
    } = await getSettings();

    if (!settingData.hasFound) throw new Error(`${settingData?.message}`);
    writeToFile(
      config.LOGS_FILE,
      `Settings has been requested by user ${userId}`
    );
    return res.status(200).json(settingData?.settings);
  } catch (error: any) {
    writeToFile(
      config.LOGS_FILE,
      `${error} while settings requested by user ${userId}`
    );
    return res.status(500).json(error?.message);
  }
});

settingsRoute.patch(
  "/",
  getUserInfo,
  authRole([config.ROLE.OWNER]),
  async (req: CustomRequest, res) => {
    const { userId } = req.user;
    const setting = req.body as Settings;
    try {
      const { updated, message }: { updated: boolean; message: string } =
        await updateSetting(setting);
      if (!updated) throw new Error(`${message}`);
      writeToFile(
        config.LOGS_FILE,
        `User ${userId} updated setting 
        ${
          setting.minBookingLen
            ? "Min booking length:" + setting.minBookingLen
            : ""
        }${
          setting.maxBookingLen
            ? "Max booking length:" + setting.maxBookingLen
            : ""
        }${
          setting.maxGuests ? "Max guests per booking:" + setting.maxGuests : ""
        }${
          setting.breakfastPrice
            ? "Breakfast price:" + setting.breakfastPrice
            : ""
        }.`
      );
      return res.status(200).json({ message });
    } catch (error: any) {
      writeToFile(
        config.LOGS_FILE,
        `${error} while user ${userId} tried to update the settings`
      );
      return res.status(304).json({ error: error?.message });
    }
  }
);

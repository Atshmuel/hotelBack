import { Router } from "express";
import {
  getSettings,
  updateSetting,
} from "../db/controllers/settingController";
import { authRole } from "../middlewares/authHelpers";
import { config } from "../config/config";
export const settingsRoute = Router();

settingsRoute.get("/", async (req, res) => {
  try {
    const settingData: {
      hasFound: boolean;
      message: string;
      settings: object;
    } = await getSettings();

    if (!settingData.hasFound) throw new Error(`${settingData?.message}`);
    return res.status(200).json(settingData?.settings);
  } catch (error: any) {
    return res.status(500).json(error?.message);
  }
});

settingsRoute.patch("/", authRole([config.ROLE.ADMIN]), async (req, res) => {
  const setting: object = req.body;
  try {
    const { updated, message }: { updated: boolean; message: string } =
      await updateSetting(setting);
    if (!updated) throw new Error(`${message}`);
    res.status(200).json({ message });
  } catch (error) {
    res.status(304).json({ error: error?.message });
  }
});

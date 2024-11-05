import { Router } from "express";
import {
  getSettings,
  updateSetting,
} from "../db/controllers/settingController";
import { authLoggedIn, authRole, getUserInfo } from "../middlewares/authHelpers";
import { config } from "../config/config";
import { CustomRequest, Settings } from "../interfaces/interfaces";
export const settingsRoute = Router();

settingsRoute.get("/", async (req: CustomRequest, res) => {
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

settingsRoute.patch(
  "/",
  authLoggedIn,
  authRole([config.ROLE.OWNER]),
  async (req: CustomRequest, res) => {
    const setting = req.body as Settings;
    try {
      const { updated, message }: { updated: boolean; message: string } =
        await updateSetting(setting);
      if (!updated) throw new Error(`${message}`);

      return res.status(200).json({ message });
    } catch (error: any) {
      return res.status(304).json({ error: error?.message });
    }
  }
);

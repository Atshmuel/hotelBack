import { Settings } from "../../interfaces/interfaces";
import { settingsModel } from "../models/models";

export const getSettings = async () => {
  const settings = await settingsModel.findOne();
  const hasFound = settings ? true : false;
  const message = hasFound
    ? "Found settings information"
    : "Failed to find settings information";
  return { hasFound, message, settings };
};

export const updateSetting = async (field: Settings) => {
  const settingsID = `65e245565858cd9c8645a088`;

  let updated = true;
  let message = "Setting successfully updated!";
  const set = await settingsModel.findByIdAndUpdate(settingsID, field);

  if (!set) {
    updated = false;
    message = "Failed to update this setting.";
  }

  return { updated, message };
};

import { Router } from "express";
import { idSchema } from "../validators/globalValidation";
import { createGuset, getGuest, guestByEmail, updateGuest } from "../db/controllers/guestController";
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

guestRouter.post('/', async (req, res) => {
  const { fullName, email } = req.body
  if (!fullName || !email) return res.status(400).json({ message: 'Name or email is missing !' })
  const guest = await createGuset(fullName, email)
  if (!guest) return res.status(400).json({ message: "Failed to create new user" });
  return res.status(200).json(guest)
})

guestRouter.get('/guest/:email', async (req, res) => {
  const guestEmail: string | undefined = req.params.email
  const guest = await guestByEmail(guestEmail)
  if (!guest) return res.status(400).json({ message: "No such user." });
  return res.status(200).json(guest)
})

guestRouter.patch('/:id', async (req, res) => {
  const id: string | undefined = req.params.id
  if (!id) return res.sendStatus(304);
  const { nationalId, flag, nationality }: { nationalId: number, flag: string, nationality: string } = req.body
  const updated = await updateGuest(nationalId, nationality, flag, id)
  return updated ? res.sendStatus(200) : res.sendStatus(304)
})
import { Router } from "express";
import { idSchema } from "../validators/globalValidation";
import { createGuset, getGuest, guestByEmail, updateGuest } from "../db/controllers/guestController";
import { ObjectId } from "mongoose";
import { config } from "../config/config";
import { CustomRequest } from "../interfaces/interfaces";
import { writeToFile } from "../services/fs";
import { getUserInfo } from "../middlewares/authHelpers";
import { deleteBooking, guestBookings } from "../db/controllers/bookingController";
import { createPaymentSession } from "../services/helpers";
import { getCabin } from "../db/controllers/cabinController";
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
  const email: string | undefined = req.params.email
  if (!email) return res.status(400).json({ message: "Please provide email !" })
  const guest = await guestByEmail(email)
  if (!guest) return res.status(400).json({ message: "No such user." });
  return res.status(200).json(guest)
})
guestRouter.get('/bookings/:guestId', async (req, res) => {
  const id: string | undefined = req.params.guestId
  const { error } = idSchema.validate(id)

  if (error) return res.status(400).json({ message: error.message })
  const data = await guestBookings(id)
  return data.length > 0 ? res.status(200).json(data) : res.status(400).json(data)
})

guestRouter.delete('/bookings/delete/:id', async (req, res) => {
  const id: string | ObjectId = req.params.id
  const { error } = idSchema.validate(id)
  if (error) return res.sendStatus(400)
  const { hasDeleted } = await deleteBooking(id)
  return hasDeleted ? res.sendStatus(200) : res.sendStatus(400)
})

guestRouter.patch('/:id', async (req, res) => {
  const id: string | undefined = req.params.id
  const { error } = idSchema.validate(id)
  if (error) return res.sendStatus(304)
  const { nationalId, flag, nationality }: { nationalId: string, flag: string, nationality: string } = req.body
  const updated = await updateGuest(nationalId, nationality, flag, id)
  return updated ? res.sendStatus(200) : res.sendStatus(304)
})

guestRouter.post("/checkout", async (req, res) => {
  const cabinId: string = req.body.id
  const quantity: number = req.body.quantity
  try {
    const cabinData = await getCabin(cabinId)
    if (!cabinData) throw new Error('Could not find this cabin.')
    const session = await createPaymentSession(cabinData, quantity)
  
    res.status(200).json(session)
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
}) 
import { Router } from "express";
import { bookingFromDateValitaor, bookingUpdateValidator, newBookingValidator } from "../validators/bookingVal";
import {
  createNewBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  getBookingsFromDate,
  updateBooking,
} from "../db/controllers/bookingController";
import { ObjectId } from "mongoose";
import { authRole } from "../middlewares/authHelpers";
import { config } from "../config/config";
import { limiter } from "../services/helpers";
import { idSchema } from "../validators/globalValidation";
export const bookingRouter = Router();

bookingRouter.post("/new", limiter(60, 1), authRole([config.ROLE.OWNER, config.ROLE.ADMIN]), async (req, res) => {
  const data = req.body;
  const { error } = newBookingValidator.validate(data);
  try {
    if (error) res.status(400).json({ error: error.details[0].message });
    const hasCreated = await createNewBooking(req.body);
    if (!hasCreated) {
      throw new Error(
        "Could not create your booking, we're currently encountered a db problem, please try again."
      );
    }
    res.status(201).json({
      message: `Your booking has been created successfully, See you soon.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

bookingRouter.get("/all", async (req, res) => {
  const {
    filter = "all",
    sortBy = "startDate-desc",
    page = 1,
  }: { filter?: string; sortBy?: string; page?: number } = req.query;
  const [field, direction] = sortBy.split("-");
  try {
    const {
      bookings,
      cabins,
      guests,
      totalBookings,
    }: { bookings?: object[]; cabins?: object[]; guests?: object[]; totalBookings?: number } =
      (await getAllBookings(filter, field, direction, page)) || {};

    res.status(200).json({ bookings, cabins, guests, totalBookings });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

bookingRouter.get("/", async (req, res) => {
  const { bookingId }: { bookingId?: ObjectId } = req.query;
  const { error } = idSchema.validate(bookingId);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  try {
    const { booking, guest, cabin } = await getBookingById(bookingId);
    if (!booking) throw new Error("Could not find this booking id.");
    res.status(200).json({ booking, guest, cabin });
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

bookingRouter.patch("/", authRole([config.ROLE.OWNER, config.ROLE.ADMIN, config.ROLE.EMPLOYEE]), limiter(60, 10), async (req, res) => {
  const { bookingId }: { bookingId?: ObjectId } = req.query;
  const newData = req.body;
  const { error: idError } = idSchema.validate(bookingId);
  const { error: dataError } = bookingUpdateValidator.validate(newData);
  if (idError || dataError) {
    return res.status(400).json({ message: idError?.message || dataError?.message });
  }
  try {
    const hasUpdated = await updateBooking(bookingId, newData);
    if (!hasUpdated)
      throw new Error("Cloud not update this booking, Please try again later.");
    res.status(200).json(bookingId);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

bookingRouter.delete(
  "/",

  authRole([config.ROLE.OWNER]), limiter(60 * 2, 2),
  async (req, res) => {

    const { bookingId }: { bookingId?: ObjectId } = req.query;
    const { error } = idSchema.validate(bookingId);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    try {
      const { hasDeleted, error } = await deleteBooking(bookingId);
      if (!hasDeleted || error) throw new Error(error);
      res.status(200).json(hasDeleted);
    } catch (error) {
      res.status(400).json(error.message);
    }
  }
);

bookingRouter.get("/from", async (req, res) => {
  const { error } = bookingFromDateValitaor.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const { last, fields }: { last?: string; fields?: string } = req.query;
  try {
    if (!last || !fields) throw new Error("Failed to get the days limit.");
    const bookings = await getBookingsFromDate(Number(last), fields);
    if (!bookings) throw new Error("Failed to get the data.");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

import { Router } from "express";
import {
  bookingFromDateValitaor,
  bookingUpdateValidator,
  newBookingValidator,
} from "../validators/bookingVal";
import {
  createNewBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  getBookingsFromDate,
  getCabinBookings,
  updateBooking,
} from "../db/controllers/bookingController";
import { ObjectId } from "mongoose";
import { authRole, getUserInfo } from "../middlewares/authHelpers";
import { config } from "../config/config";
import { limiter } from "../services/helpers";
import { idSchema } from "../validators/globalValidation";
import { writeToFile } from "../services/fs";
import { BookingUpdate, CustomRequest } from "../interfaces/interfaces";
export const bookingRouter = Router();

bookingRouter.post(
  "/new",
  limiter(60, 999999),
  async (req, res) => {
    const data = req.body;
    const { error } = newBookingValidator.validate(data);
    try {
      if (error) return res.status(400).json({ error: error.details[0].message });
      const { hasCreated, message } = await createNewBooking({ ...data, createdAt: new Date() });

      if (!hasCreated) {
        throw new Error(message);
      }
      return res.status(201).json({ message, redirect: '/cabins/thankyou' })
    } catch (error: any) {
      return res.status(400).json({ error: error?.message });
    }
  }
);

bookingRouter.get('/bookingByCabinId', async (req, res) => {
  const { id }: { id?: string } = req.query;
  const { error } = idSchema.validate(id);
  if (error) return res.status(400).json({ message: 'id is not valid !' })
  try {
    const bookings = await getCabinBookings(id)
    if (!bookings.length) throw Error("Could not find any booking")
    res.status(200).json(bookings)
  } catch (error) {
    res.status(404).json({ error: error?.message });
  }


})

bookingRouter.get("/all", async (req: CustomRequest, res) => {
  try {
    const {
      filter = "all",
      sortBy = "startDate-desc",
      page = 1,
    }: { filter?: string; sortBy?: string; page?: number } = req.query;
    const [field, direction] = sortBy.split("-");
    const {
      bookings,
      cabins,
      guests,
      totalBookings,
    }: {
      bookings?: object[];
      cabins?: object[];
      guests?: object[];
      totalBookings?: number;
    } = (await getAllBookings(filter, field, direction, page)) || {};
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

bookingRouter.get('/booking/:id', async (req, res) => {
  const id: string | ObjectId = req.params.id
  const { error } = idSchema.validate(id)

  if (error) return res.sendStatus(400)
  const { booking, cabin, guest } = await getBookingById(id)
  if (!booking || !cabin || !guest) return res.sendStatus(400)
  return res.status(200).json({ booking, cabin, guest })

})


bookingRouter.patch(
  "/",
  getUserInfo,
  authRole([config.ROLE.OWNER, config.ROLE.ADMIN, config.ROLE.EMPLOYEE]),
  limiter(60, 10),
  async (req: CustomRequest, res) => {
    const userData = req?.user;

    const { bookingId }: { bookingId?: ObjectId } = req.query;
    const newData = req.body;
    const { error: idError } = idSchema.validate(bookingId);
    const { error: dataError } = bookingUpdateValidator.validate(newData);
    if (idError || dataError) {
      return res
        .status(400)
        .json({ message: idError?.message || dataError?.message });
    }
    try {
      if (!userData) throw new Error("Failed to get user data.");
      const hasUpdated = await updateBooking(bookingId, newData);
      if (!hasUpdated)
        throw new Error(
          "Cloud not update this booking, Please try again later."
        );
      writeToFile(
        config.LOGS_FILE,
        `User: ${userData.userId} updated booking ${bookingId}\n new data:
        ${newData?.status ? `Status: ${newData?.status}\n` : ""}${newData?.extrasPrice ? `extarsPrices: ${newData?.extrasPrice}\n` : ""
        }${newData?.totalPrice ? `totalPrice: ${newData?.totalPrice}\n` : ""}${newData?.hasBreakfast ? `Breakfast: ${newData?.hasBreakfast}\n` : ""
        }${newData?.isPaid ? `Paid: ${newData?.isPaid}\n` : ""}`
      );
      res.status(200).json(bookingId);
    } catch (error) {
      writeToFile(
        config.LOGS_FILE,
        `${error}\nwhen booking ${bookingId} requested${userData ? " by user:" + userData?.userId : ""
        }.`
      );
      res.status(400).json(error.message);
    }
  }
);

bookingRouter.patch('/update/:id', async (req, res) => {
  const id: string | ObjectId = req.params.id
  const { numGuests, observations }: { numGuests: number, observations: string } = req.body
  const { error } = idSchema.validate(id)
  if (Number.isNaN(Number(numGuests))) return res.sendStatus(400)
  const data: BookingUpdate = { numGuests: Number(numGuests), observations }
  if (error) return res.sendStatus(400)
  const updated = await updateBooking(id, data)
  return updated ? res.sendStatus(200) : res.sendStatus(400)
})

bookingRouter.delete(
  "/",
  authRole([config.ROLE.ADMIN]),
  limiter(60 * 2, 2),
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

bookingRouter.get("/from", getUserInfo, async (req: CustomRequest, res) => {
  const userData = req?.user;
  const { error } = bookingFromDateValitaor.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const { last, fields }: { last?: string; fields?: string } = req.query;
  try {
    if (!userData) throw new Error("Failed to get user data.");
    if (!last || !fields) throw new Error("Failed to get the days limit.");
    const bookings = await getBookingsFromDate(Number(last), fields);
    if (!bookings) throw new Error("Failed to get the data.");
    writeToFile(
      config.LOGS_FILE,
      `Bookings from ${last} and ${fields} found,${userData ? " requested by user:" + userData?.userId : ""
      }.`
    );
    res.status(200).json(bookings);
  } catch (error) {
    writeToFile(
      config.LOGS_FILE,
      `${error}\nwhen booking from ${last} and ${fields} requested${userData ? " by user:" + userData?.userId : ""
      }.`
    );
    res.status(400).json(error.message);
  }
});

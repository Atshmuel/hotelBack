import { bookingModel, cabinModel, guestModel } from "../models/models";
import { BookingUpdate, Bookings } from "../../interfaces/interfaces";
import { SortOrder, ObjectId } from "mongoose";
import { config } from "../../config/config";
import { getTime } from "../../services/helpers";

export const createNewBooking = async (data: Bookings) => {
  const newBooking = await bookingModel.create(data);
  const findNewBooking = await bookingModel.findById(newBooking?._id);
  const hasCreated =
    findNewBooking?._id.toString() === undefined ? false : true;
  return hasCreated;
};

export const updateBooking = async (id: ObjectId, data: BookingUpdate) => {
  const newData = { ...data, lastUpdate: getTime() };
  const updatedBooking = await bookingModel.findByIdAndUpdate(id, newData);
  return updatedBooking ? true : false;
};

export const deleteBooking = async (id: ObjectId) => {
  let error;
  let hasDeleted;

  const bookingStatus = await bookingModel.findById(id);
  if (!bookingStatus) error = "Could not find this booking id";
  if (bookingStatus?.status !== "unconfirmed") {
    error =
      "Cannot delete booking if the status is different from 'unconfirmed'";
  }
  hasDeleted = await bookingModel.findByIdAndDelete(id);
  return { hasDeleted, error };
};

export const getBookingById = async (id: ObjectId) => {
  const booking = await bookingModel.findById(id);
  const guest = await guestModel.findById(booking?.guestID);
  const cabin = await cabinModel.findById(booking?.cabinID);

  return { booking, guest, cabin };
};

export const getAllBookings = async (
  filter: string,
  field: string,
  direction: string,
  page: number
) => {
  const sortBy = { [field]: direction as SortOrder };
  const skipVal = (+page - 1) * config.PAGE_SIZE;
  const totalBookings =
    filter === "all"
      ? await bookingModel.find().countDocuments()
      : await bookingModel
        .find({ status: filter.toLowerCase() })
        .countDocuments();

  const bookings =
    filter === "all"
      ? await bookingModel
        .find()
        .sort(sortBy)
        .skip(skipVal)
        .limit(config.PAGE_SIZE)
      : await bookingModel
        .find({ status: filter.toLowerCase() })
        .sort(sortBy)
        .skip(skipVal)
        .limit(config.PAGE_SIZE);

  const cabins = await Promise.all(
    bookings.map(async (booking) => {
      return await cabinModel.findById(booking?.cabinID);
    })
  );
  const guests = await Promise.all(
    bookings.map(async (booking) => {
      return await guestModel.findById(booking?.guestID);
    })
  );

  return { bookings, guests, cabins, totalBookings };
};

export const getBookingsFromDate = async (last: number, fields: string) => {
  const date = new Date();

  date.setDate(date.getDate() - last);
  const checkDate = date.toISOString();

  const bookings = await bookingModel.find(
    {
      startDate: { $gte: checkDate },
    },
    `${fields.split("-").join(" ")} -_id`
  ).sort({ startDate: "asc" });

  if (!bookings) throw new Error("Failed to get this data.");

  return bookings;
};

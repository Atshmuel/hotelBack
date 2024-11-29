import { bookingModel, cabinModel, guestModel } from "../models/models";
import { BookingUpdate, Bookings } from "../../interfaces/interfaces";
import { SortOrder, ObjectId } from "mongoose";
import { config } from "../../config/config";
import { getTime } from "../../services/helpers";
import { eachDayOfInterval, isAfter, isEqual } from "date-fns";

export const createNewBooking = async (data: Bookings) => {
  const allBookings = await getCabinBookings(data.cabinID)
  const allBookingDates = allBookings?.length ? allBookings.flatMap(booking =>
    eachDayOfInterval({ start: booking.startDate, end: booking.endDate })
  ) : []
  const bookingDates = eachDayOfInterval({ start: data.startDate, end: data.endDate })

  const alreadyBooked = allBookingDates?.length && allBookingDates.some(date1 => {
    return bookingDates.some(date2 => {
      return isEqual(date1, date2)
    })
  })
  if (alreadyBooked) return { hasCreated: false, message: "Dates already booked!." }

  const newBooking = await bookingModel.create(data);
  if (!newBooking) return { hasCreated: false, message: "Failed to reserve booking." }

  return { hasCreated: true, message: "booking reserved successfully" }
};

export const updateBooking = async (id: ObjectId | string, data: BookingUpdate) => {
  const oldBookingData = await bookingModel.findById(id);
  const newData = { ...oldBookingData.toObject(), ...data, lastUpdate: getTime() };
  const updatedBooking = await bookingModel.findByIdAndUpdate(id, newData);
  return updatedBooking ? true : false;
};

export const deleteBooking = async (id: ObjectId | string) => {
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

export const getBookingById = async (id: ObjectId | string) => {
  const booking = await bookingModel.findById(id);
  const guest = await guestModel.findById(booking?.guestID);
  const cabin = await cabinModel.findById(booking?.cabinID);

  return { booking, guest, cabin };
};

export const getCabinBookings = async (id: ObjectId | string): Promise<Bookings[]> => {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const bookings = (await bookingModel.find()).filter(booking =>
    booking.cabinID.toString() === id).filter(booking =>
      isEqual(booking.startDate, today) || isAfter(booking.startDate, today) || booking.status === 'checked-in'
    )
  return bookings
}



export const getAllBookings = async (
  filter: string = 'all',
  field: string = "startDate",
  direction: string = "desc",
  page: number = 1
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


export const guestBookings = async (id: string, field = 'startDate', direction: 1 | -1 = -1) => {

  const bookings = await bookingModel.find({ guestID: id }).sort({ [field]: direction })
  const cabinsInfo = await Promise.all(
    bookings.map(async (booking) => {
      const cabin = await cabinModel.findById(booking?.cabinID);
      return { id: cabin?._id, name: cabin?.name, img: cabin?.imgsUrl.at(0) }
    })
  )
  const updatedBookings = bookings.map((booking, i) => {
    return { ...booking.toObject(), cabinName: cabinsInfo.at(i).name, cabinImg: cabinsInfo.at(i).img }
  })

  return updatedBookings
}
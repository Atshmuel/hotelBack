import { Request } from "express";
import { Document, ObjectId, Schema } from "mongoose";

export interface Cabins extends Document {
  createdAt: string;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string;
  imgsUrl: string[];
  productId: string;
  lastUpdate?: Date;
}
export interface CabinUpdateData {
  name?: string;
  maxCapacity?: number;
  regularPrice?: number;
  discount?: number;
  description?: string;
  imgsUrl?: string[];
  lastUpdate?: Date;
}

export interface Guests extends Document {
  createdAt?: Date;
  fullName: string;
  email: string;
  nationalID: number;
  nationality: string;
  countryFlag: string;
}

export interface Settings extends Document {
  createdAt: Date;
  minBookingLen: number;
  maxBookingLen: number;
  maxGuests: number;
  breakfastPrice: number;
}
export interface Bookings extends Document {
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  numNights: number;
  numGuests: number;
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  hasBreakfast: boolean;
  isPaid: boolean;
  observations: string;
  status: string;
  cabinID: Schema.Types.ObjectId;
  guestID: Schema.Types.ObjectId;
  cabinImg?: string,
  cabinName?: string,
  sId?:string,
}
export interface BookingUpdate {
  startDate?: Date;
  endDate?: Date;
  numNights?: number;
  numGuests?: number;
  cabinPrice?: number;
  extrasPrice?: number;
  totalPrice?: number;
  hasBreakfast?: boolean;
  isPaid?: boolean;
  observations?: string;
  status?: string;
  cabinID?: Schema.Types.ObjectId;
  guestID?: Schema.Types.ObjectId;
  lastUpdate?: Date;
}

export interface ID {
  id: string;
}

export interface Users extends Document {
  userId?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  userAvatar: string;
  createdAt?: Date;
  lastPasswordChange?: Date;
  refreshToken?: string[];
}

export interface Roles {
  role: string;
}

export interface CustomRequest extends Request {
  user?: Users;
  req: Request;
}

export interface newCabinInt extends Document {
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string;
  productId: string
  imgsUrl: string[];
}

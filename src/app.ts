import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config/config";
import { bookingRouter } from "./routes/bookingRoute";
import { cabinRouter } from "./routes/cabinRoute";
import { guestRouter } from "./routes/guestRoute";
import { settingsRoute } from "./routes/settingsRoute";
import { userRouter } from "./routes/userRoute";

import cookieParser from "cookie-parser";
import { authLoggedIn } from "./middlewares/authHelpers";

const { PORT, DB } = config;

const app = express();
app.use(
  cors({
    origin: ["https://management-wildhotel.onrender.com", 'http://localhost:5173'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', false);
app.use("/bookings", authLoggedIn, bookingRouter);
app.use("/cabins", authLoggedIn, cabinRouter);
app.use("/guests", authLoggedIn, guestRouter);
app.use("/settings", authLoggedIn, settingsRoute);
app.use("/users", userRouter);

const main = async () => {
  try {
    await mongoose.connect(`${DB}`);
    console.log(mongoose.connection.readyState === 1 && `Connected to DB.`);
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1);
  }
};
main();

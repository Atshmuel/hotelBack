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
import { logFileUse, writeToFile } from "./services/fs";

const { PORT, DB, LOGS_FILE } = config;

const app = express();
app.use(
  cors({
    origin: [
      "https://management-wildhotel.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", false);
app.use("/bookings", bookingRouter);
app.use("/cabins", cabinRouter);
app.use("/guests", guestRouter);
app.use("/settings", settingsRoute);
app.use("/users", userRouter);

const main = async () => {
  try {
    logFileUse(LOGS_FILE);
    await mongoose.connect(`${DB}`);
    app.listen(PORT, () => {
      console.log(mongoose.connection.readyState === 1 && `Connected to DB.`);
      console.log(`Listening on port ${PORT}`);
      writeToFile(LOGS_FILE, `Server running.`);
    });
  } catch (error) {
    console.error("Error:", error);
    writeToFile(LOGS_FILE, error);
    process.exit(1);
  }
};
main();

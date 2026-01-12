import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
connectDB();

import userRoute from "./routers/userRoute.js";
import hrRoute from "./routers/hrRoute.js";
import managerRoute from "./routers/managerRoute.js";
import employeeRouter from "./routers/employeeRoutes.js";
import superAdminRoute from "./routers/superAdminRoutes.js";
app.use("/user", userRoute);
app.use("/hr", hrRoute);
app.use("/manager", managerRoute);
app.use("/employee", employeeRouter);
app.use("/superAdmin", superAdminRoute);

app.listen(process.env.PORT, () => {
  console.log(`server is running at ${process.env.PORT}`);
});

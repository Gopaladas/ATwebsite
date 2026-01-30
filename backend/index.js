import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socket.js"; // 👈 socket logic

dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/* ---------- DB ---------- */
connectDB();

/* ---------- ROUTES ---------- */
import userRoute from "./routers/userRoute.js";
import hrRoute from "./routers/hrRoute.js";
import managerRoute from "./routers/managerRoute.js";
import employeeRouter from "./routers/employeeRoutes.js";
import superAdminRoute from "./routers/superAdminRoutes.js";
import messageRouter from "./routers/messageRoutes.js";
import managerTaskrouter from "./routers/managerTaskRoutes.js";
import employeeTaskRouter from "./routers/EmployeeTaskRoutes.js";

app.use("/user", userRoute);
app.use("/hr", hrRoute);
app.use("/manager", managerRoute);
app.use("/employee", employeeRouter);
app.use("/superAdmin", superAdminRoute);
app.use("/messages", messageRouter);
app.use("/managerTasks", managerTaskrouter);
app.use("/employeeTasks", employeeTaskRouter);
/* ---------- SOCKET SETUP ---------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

initSocket(io);

/* ---------- START SERVER ---------- */
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});

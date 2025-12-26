import express from "express";
import { managerOnly, verifyToken } from "../middleware/authMiddleware.js";
import {
  approveLeave,
  deactivateEmployee,
  getHolidays,
  getManagerProfile,
  getMonthlyAttendance,
  getMyEmployees,
  getTeamLeaves,
  getTodayAttendance,
  rejectLeave,
} from "../controllers/managerController.js";

const managerRoute = express.Router();

managerRoute.get("/profile", verifyToken, managerOnly, getManagerProfile);

managerRoute.get("/employees", verifyToken, managerOnly, getMyEmployees);
managerRoute.patch(
  "/employees/:id/deactivate",
  verifyToken,
  managerOnly,
  deactivateEmployee
);

managerRoute.get(
  "/attendance/today",
  verifyToken,
  managerOnly,
  getTodayAttendance
);
managerRoute.get(
  "/attendance/monthly",
  verifyToken,
  managerOnly,
  getMonthlyAttendance
);

managerRoute.get("/leaves", verifyToken, managerOnly, getTeamLeaves);
managerRoute.patch(
  "/leaves/:id/approve",
  verifyToken,
  managerOnly,
  approveLeave
);
managerRoute.patch("/leaves/:id/reject", verifyToken, managerOnly, rejectLeave);

managerRoute.get("/holidays", verifyToken, managerOnly, getHolidays);

export default managerRoute;

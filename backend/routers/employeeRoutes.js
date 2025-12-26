import express from "express";
import { employeeOnly, verifyToken } from "../middleware/authMiddleware.js";
import {
  applyLeave,
  getEmployeeProfile,
  getMyAttendance,
  getMyLeaves,
} from "../controllers/EmployeeController.js";
import { getHolidays } from "../controllers/managerController.js";

const employeeRouter = express.Router();

employeeRouter.get("/profile", verifyToken, employeeOnly, getEmployeeProfile);

employeeRouter.post("/leaveapply", verifyToken, employeeOnly, applyLeave);

employeeRouter.get("/leaves", verifyToken, employeeOnly, getMyLeaves);

employeeRouter.get("/attendance", verifyToken, employeeOnly, getMyAttendance);

employeeRouter.get("/holidays", verifyToken, employeeOnly, getHolidays);

export default employeeRouter;

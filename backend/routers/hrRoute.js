import express from "express";
import {
  activateManager,
  addPublicHoliday,
  deleteManager,
  getEmployees,
  getHrDetails,
  getManagers,
  viewAttendance,
} from "../controllers/hrController.js";
import { onlyHr, verifyToken } from "../middleware/authMiddleware.js";

const hrRoute = express.Router();

hrRoute.get("/getprofile", verifyToken, onlyHr, getHrDetails);
hrRoute.get("/getManagers", verifyToken, onlyHr, getManagers);
hrRoute.get("/getEmployees", verifyToken, onlyHr, getEmployees);
hrRoute.get("/activateManger/:id", verifyToken, onlyHr, activateManager);
hrRoute.get("/deleteManager/:id", verifyToken, onlyHr, deleteManager);
hrRoute.post("/addHoliday", verifyToken, onlyHr, addPublicHoliday);
hrRoute.get("/attendance", verifyToken, onlyHr, viewAttendance);
export default hrRoute;

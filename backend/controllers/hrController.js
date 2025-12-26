import User from "../models/userModel.js";
import Holiday from "../models/holidayModel.js";
import Attendance from "../models/attendanceModel.js";

const getHrDetails = async (req, res) => {
  const id = req.userId;
  try {
    const Hr = await User.findById(id);
    if (!Hr) return res.status(400).json({ message: "User not exist" });
    const { password, ...safeHr } = Hr._doc;
    return res
      .status(200)
      .json({ message: "successfully fetched", data: safeHr });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getManagers = async (req, res) => {
  try {
    const list = await User.find({ role: "Manager" }, "-password");
    return res
      .status(200)
      .json({ message: "successfully fetched", data: list });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const list = await User.find({ role: "Employee" }, "-password");
    return res
      .status(200)
      .json({ message: "successfully fetched", data: list });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteManager = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Manager id is required" });
  }

  try {
    const manager = await User.findById(id);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    if (manager.role !== "Manager") {
      return res.status(400).json({ message: "User is not a manager" });
    }

    manager.isActive = false;
    await manager.save();

    return res.status(200).json({
      message: "Manager deactivated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const activateManager = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Manager id is required" });
  }

  try {
    const manager = await User.findById(id);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    if (manager.role !== "Manager") {
      return res.status(400).json({ message: "User is not a manager" });
    }

    manager.isActive = true;
    await manager.save();

    return res.status(200).json({
      message: "Manager activated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addPublicHoliday = async (req, res) => {
  try {
    const { name, date, type } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: "Name and date are required" });
    }

    const holidayDate = new Date(date);
    const year = holidayDate.getFullYear();

    const existingHoliday = await Holiday.findOne({ date: holidayDate });
    if (existingHoliday) {
      return res.status(409).json({
        message: "Holiday already exists for this date",
      });
    }

    const holiday = await Holiday.create({
      name,
      date: holidayDate,
      year,
      type,
      createdBy: req.userId,
    });

    return res.status(201).json({
      message: "Public holiday added successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("Add holiday error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const viewAttendance = async (req, res) => {
  try {
    const { date, employeeId, managerId, department } = req.query;

    let attendanceQuery = {};

    // Filter by date
    if (date) {
      attendanceQuery.date = date; // "2025-01-25"
    }

    // Filter by employee directly
    if (employeeId) {
      attendanceQuery.userId = employeeId;
    }

    // Build user filter (for manager / department)
    let userFilter = {};

    if (managerId) {
      userFilter._id = managerId;
    }

    if (department) {
      userFilter.department = department;
    }

    const attendance = await Attendance.find(attendanceQuery)
      .populate({
        path: "userId",
        match: userFilter,
        select: "userName email role department",
      })
      .sort({ date: -1 });

    const filteredAttendance = attendance.filter((a) => a.userId !== null);

    return res.status(200).json({
      count: filteredAttendance.length,
      data: filteredAttendance,
    });
  } catch (error) {
    console.error("VIEW ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  getHrDetails,
  getManagers,
  getEmployees,
  deleteManager,
  activateManager,
  addPublicHoliday,
  viewAttendance,
};

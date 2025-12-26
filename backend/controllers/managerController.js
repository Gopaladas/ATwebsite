import Attendance from "../models/attendanceModel.js";
import Holiday from "../models/holidayModel.js";
import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";

const getManagerProfile = async (req, res) => {
  try {
    const manager = await User.findById(req.userId).select("-password");

    if (!manager || manager.role !== "Manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ data: manager });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("-password");

    res.json({ data: employees });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deactivateEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await User.findOne({
    _id: id,
    managerId: req.userId,
    role: "Employee",
  });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.isActive = false;
  await employee.save();

  res.json({ message: "Employee deactivated" });
};

const getTodayAttendance = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const attendance = await Attendance.find({
    managerId: req.userId,
    date: today,
  }).populate("employeeId", "userName email");

  res.json({ data: attendance });
};

const getMonthlyAttendance = async (req, res) => {
  const { month, year } = req.query;

  const report = await Attendance.find({
    managerId: req.userId,
    month,
    year,
  }).populate("employeeId", "userName");

  res.json({ data: report });
};

const getTeamLeaves = async (req, res) => {
  try {
    const employees = await User.find(
      { managerId: req.userId },
      "_id userName email department"
    );

    console.log("emp", employees);

    if (!employees.length) {
      return res.status(200).json({ data: [] });
    }

    const employeeIds = employees.map((emp) => emp._id);

    const leaves = await Leave.find({
      user: { $in: employeeIds },
    })
      .populate("user", "userName email department")
      .sort({ createdAt: -1 });

    console.log("leaves", leaves);

    return res.status(200).json({ data: leaves });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const approveLeave = async (req, res) => {
  const leave = await Leave.findOne({
    user: req.params.id,
  });

  if (!leave) return res.status(404).json({ message: "Leave not found" });

  leave.status = "APPROVED";
  await leave.save();

  await User.findByIdAndUpdate(leave.employeeId, {
    $inc: { leaveCount: -1 },
    isOnLeave: true,
  });

  res.json({ message: "Leave approved" });
};

const rejectLeave = async (req, res) => {
  const leave = await Leave.findOne({
    user: req.params.id,
  });

  if (!leave) return res.status(404).json({ message: "Leave not found" });

  leave.status = "REJECTED";
  await leave.save();

  res.json({ message: "Leave rejected" });
};

const getHolidays = async (req, res) => {
  const { year } = req.query;

  const holidays = await Holiday.find({ year });

  res.json({ data: holidays });
};

export {
  getManagerProfile,
  getMyEmployees,
  deactivateEmployee,
  getTodayAttendance,
  getMonthlyAttendance,
  getTeamLeaves,
  approveLeave,
  rejectLeave,
  getHolidays,
};

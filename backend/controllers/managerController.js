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

  return res.json({ message: "Employee deactivated" });
};

const activateEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await User.findOne({
    _id: id,
    managerId: req.userId,
    role: "Employee",
  });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.isActive = true;
  await employee.save();

  return res.json({ message: "Employee activated" });
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Get manager employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((e) => e._id);

    // 2️⃣ Attendance for them
    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: today,
    }).populate("userId", "userName email department");

    res.status(200).json({ data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 1. Get manager's employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((emp) => emp._id);

    // 2. Fetch attendance for those employees
    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date,
    }).populate("userId", "userName department imageUrl");

    res.status(200).json({ data: attendance });
  } catch (err) {
    console.error("Team attendance error", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Manager employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((e) => e._id);

    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: {
        $gte: startDate.toISOString().split("T")[0],
        $lte: endDate.toISOString().split("T")[0],
      },
    }).populate("userId", "userName department");

    res.status(200).json({ data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamLeaves = async (req, res) => {
  try {
    const employees = await User.find({
      managerId: req.userId,
      role: "Employee",
    }).select("_id");

    if (!employees.length) {
      return res.status(200).json({ data: [] });
    }

    const employeeIds = employees.map((emp) => emp._id);

    const leaves = await Leave.find({
      user: { $in: employeeIds },
    })
      .populate("user", "userName email department imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: leaves });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "APPROVED";
    leave.approvedBy = req.userId;
    await leave.save();

    await User.findByIdAndUpdate(leave.user, {
      isOnLeave: true,
      $inc: { leaveCount: -1 },
    });

    res.json({ message: "Leave approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "REJECTED";
    leave.approvedBy = req.userId;
    await leave.save();

    res.json({ message: "Leave rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getHolidays = async (req, res) => {
  const { year } = req.query;

  const holidays = await Holiday.find({ year });

  res.json({ data: holidays });
};

const getMyAttendance = async (req, res) => {
  const attendance = await Attendance.find({
    userId: req.userId,
  }).sort({ date: -1 });

  res.json({ data: attendance });
};

const applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate, leaveType } = req.body;

    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const holiday = await Holiday.findOne({
      date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
    });

    if (holiday) {
      return res
        .status(400)
        .json({ message: "Public holidays are ignored automatically" });
    }

    const leave = await Leave.create({
      user: req.userId,
      reason,
      fromDate,
      toDate,
      leaveType,
    });

    res.status(201).json({
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json({ data: leaves });
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
  getTeamAttendance,
  activateEmployee,
  getMyAttendance,
  applyLeave,
  getMyLeaves,
};

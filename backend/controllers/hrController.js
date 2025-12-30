import User from "../models/userModel.js";
import Holiday from "../models/holidayModel.js";
import Attendance from "../models/attendanceModel.js";
import Leave from "../models/leaveModel.js";
import sendEmail from "../utils/sendEmail.js";

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

const getManagersAttendanceForHR = async (req, res) => {
  try {
    // Step 1: Find all managers
    const managers = await User.find({ role: "Manager" }).select(
      "_id userName email department"
    );

    if (!managers.length) {
      return res.status(404).json({
        success: false,
        message: "No managers found",
      });
    }

    const managerIds = managers.map((m) => m._id);

    // Step 2: Fetch attendance of those managers
    const attendance = await Attendance.find({
      userId: { $in: managerIds },
    })
      .populate("userId", "userName email department role")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching manager attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTeamLeaves = async (req, res) => {
  try {
    console.log(req.userId);
    const employees = await User.find({
      hrId: req.userId,
      role: "Manager",
    }).select("_id");

    if (!employees.length) {
      return res.status(200).json({ data: [] });
    }

    console.log(employees);
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
    const leave = await Leave.findById(req.params.id).populate("user");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "APPROVED";
    leave.approvedBy = req.userId;
    await leave.save();

    const hr = await User.findById(req.userId);

    // Update manager leave status
    await User.findByIdAndUpdate(leave.user._id, {
      isOnLeave: true,
      $inc: { leaveCount: -1 },
    });

    // 📧 EMAIL TO MANAGER
    await sendEmail({
      from: {
        name: hr.userName,
        email: hr.email,
      },
      to: leave.user.email,
      subject: "Leave Approved ✅",
      html: `
        <p>Hello ${leave.user.userName},</p>
        <p>Your <b>${leave.leaveType}</b> leave has been <b>approved</b>.</p>
        <p><b>From:</b> ${leave.fromDate.toDateString()}</p>
        <p><b>To:</b> ${leave.toDate.toDateString()}</p>
        <br/>
        <p>Regards,<br/>${hr.userName} (HR)</p>
      `,
    });

    res.json({ message: "Leave approved and email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("user");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "REJECTED";
    leave.approvedBy = req.userId;
    await leave.save();

    const hr = await User.findById(req.userId);

    // 📧 EMAIL TO MANAGER
    await sendEmail({
      from: {
        name: hr.userName,
        email: hr.email,
      },
      to: leave.user.email,
      subject: "Leave Rejected ❌",
      html: `
        <p>Hello ${leave.user.userName},</p>
        <p>Your <b>${leave.leaveType}</b> leave has been <b>rejected</b>.</p>
        <p>Please contact HR for more details.</p>
        <br/>
        <p>Regards,<br/>${hr.userName} (HR)</p>
      `,
    });

    res.json({ message: "Leave rejected and email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // set by auth middleware
    const { userName, phoneNumber, department, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Prevent role/email updates from frontend
    user.userName = userName ?? user.userName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.department = department ?? user.department;
    user.bio = bio ?? user.bio;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
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
  getManagersAttendanceForHR,
  getTeamLeaves,
  approveLeave,
  rejectLeave,
  updateProfile,
};

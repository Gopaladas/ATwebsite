import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Holiday from "../models/holidayModel.js";
import Attendance from "../models/attendanceModel.js";
import isPublicHoliday from "../utils/isPublicHoliday.js";

const register = async (req, res) => {
  try {
    const { email, userName, password, phoneNumber, department } = req.body;
    const loggedInRole = req.userRole;
    // console.log(loggedInRole);
    const loggedInUserId = req.userId;

    if (!email || !userName || !password || !phoneNumber || !department)
      return res.status(400).json({ message: "Enter the fields" });

    let roleToAssign;
    let managerId = null;

    if (loggedInRole === "Hr") roleToAssign = "Manager";
    else if (loggedInRole === "Manager") {
      roleToAssign = "Employee";
      managerId = loggedInUserId;
    } else return res.status(403).json({ message: "Not allowed" });

    const user = await User.findOne({ email });
    if (user)
      return res
        .status(401)
        .json({ message: "User already exist with this email" });

    const hashPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      email,
      userName,
      password: hashPassword,
      phoneNumber,
      role: roleToAssign,
      department,
      managerId,
    });

    const { password: _, ...safeUser } = createdUser._doc;

    return res
      .status(200)
      .json({ message: "Successfully created", data: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const seedHr = async (req, res) => {
  try {
    const { email, userName, password, phoneNumber } = req.body;

    const existingHr = await User.findOne({ role: "Hr" });
    if (existingHr)
      return res.status(409).json({ message: "HR already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const hr = await User.create({
      email,
      userName,
      password: hashedPassword,
      phoneNumber,
      role: "Hr",
    });

    res.status(201).json({
      message: "HR created successfully",
      hrId: hr._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Enter all fields" });

  try {
    const userExist = await User.findOne({ email });
    if (!userExist) return res.status(400).json({ message: "User not found" });

    const verifyPassword = await bcrypt.compare(password, userExist.password);

    if (!verifyPassword)
      return res.status(400).json({ message: "Password incorrect" });

    let expiry;

    if (userExist.role === "Hr") expiry = "1h";
    else if (userExist.role === "Manager") expiry = "2h";
    else expiry = "8h";

    const token = jwt.sign(
      { id: userExist._id, role: userExist.role },
      process.env.JWT_SECRET,
      { expiresIn: expiry }
    );

    const isProduction = process.env.ENVI === "production";

    res.cookie(`${userExist.role}Token`, token, {
      httpOnly: true, // JS cannot access
      secure: isProduction, // HTTPS only in prod
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60, // 1 hour (browser-side)
    });

    const { password: _, ...safeUser } = userExist._doc;

    return res.status(200).json({
      message: "Login successful",
      data: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  const role = req.userRole;
  try {
    res.clearCookie(`${role}Token`, {
      httpOnly: true,
      secure: process.env.NODE_ENVI === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPublicHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });

    return res.status(200).json(holidays);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const startAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];
    const { imageUrl } = req.body;

    if (!imageUrl)
      return res.status(400).json({ message: "Start photo required" });

    const holiday = await isPublicHoliday(today);
    if (holiday) {
      return res.status(403).json({
        message: "Today is a public holiday. Attendance not allowed.",
      });
    }

    const existing = await Attendance.findOne({ userId, date: today });
    if (existing && existing.startTime)
      return res.status(400).json({ message: "Attendance already started" });

    const attendance = await Attendance.create({
      userId,
      date: today,
      startTime: new Date(),
      startPhoto: imageUrl, // ✅ Cloudinary URL
      status: "Incomplete",
    });

    return res.status(201).json({
      message: "Attendance started",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const endAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "End photo required" });
    }

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance || !attendance.startTime) {
      return res.status(400).json({ message: "Attendance not started" });
    }

    const tempEndTime = new Date();
    const diffMs = tempEndTime - attendance.startTime;
    const hours = diffMs / (1000 * 60 * 60);
    const totalHours = Number(hours.toFixed(2));

    if (totalHours < 8) {
      return res.status(200).json({
        message: `Work ${(8 - totalHours).toFixed(2)} more hours`,
        workedHours: totalHours,
        status: "INCOMPLETE",
      });
    }

    // ✅ Only now we finalize & save
    attendance.endTime = tempEndTime;
    attendance.endPhoto = imageUrl;
    attendance.totalHours = totalHours;
    attendance.status = "Present";

    await attendance.save();

    return res.status(200).json({
      message: "Attendance completed",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  register,
  login,
  seedHr,
  logout,
  startAttendance,
  endAttendance,
  getPublicHolidays,
};

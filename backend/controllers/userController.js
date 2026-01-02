import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Holiday from "../models/holidayModel.js";
import Attendance from "../models/attendanceModel.js";
import isPublicHoliday from "../utils/isPublicHoliday.js";
import sendEmail from "../utils/sendEmail.js";

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
    let hrId = null;

    if (loggedInRole === "Hr") {
      hrId = loggedInUserId;
      roleToAssign = "Manager";
    } else if (loggedInRole === "Manager") {
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
      hrId,
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
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  const isProduction = process.env.ENVI === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/", // VERY IMPORTANT
  };

  res.clearCookie("HrToken", cookieOptions);
  res.clearCookie("ManagerToken", cookieOptions);
  res.clearCookie("EmployeeToken", cookieOptions);

  return res.status(200).json({ message: "Logged out successfully" });
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

    if (!imageUrl) {
      return res.status(400).json({ message: "Start photo required" });
    }

    // ❌ Public holiday check
    const holiday = await isPublicHoliday(today);
    if (holiday) {
      return res.status(403).json({
        message: "Today is a public holiday. Attendance not allowed.",
      });
    }

    // ❌ Already started?
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing?.startTime) {
      return res.status(400).json({ message: "Attendance already started" });
    }

    // ✅ Create ONLY once
    const attendance = await Attendance.create({
      userId,
      date: today,
      startTime: new Date(),
      startPhoto: imageUrl,
      status: "Incomplete",
    });

    return res.status(201).json({
      message: "Attendance started",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const REQUIRED_HOURS = 0.01; // company policy

const endAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "End photo required" });
    }

    // 🔍 Find today's attendance
    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(400).json({ message: "Attendance not started" });
    }

    if (!attendance.startTime) {
      return res.status(400).json({ message: "Start attendance missing" });
    }

    // 🚫 Prevent double checkout
    if (attendance.endTime) {
      return res.status(400).json({
        message: "Attendance already completed",
      });
    }

    const endTime = new Date();
    const workedMs = endTime - attendance.startTime;
    const workedHours = +(workedMs / (1000 * 60 * 60)).toFixed(2);

    // 📸 Always save checkout photo & time
    attendance.endTime = endTime;
    attendance.endPhoto = imageUrl;
    attendance.totalHours = workedHours;

    // 🟡/🟢 Status decision
    if (workedHours >= REQUIRED_HOURS) {
      attendance.status = "Present";
    } else {
      attendance.status = "Incomplete";
    }

    await attendance.save();

    return res.status(200).json({
      message:
        workedHours >= REQUIRED_HOURS
          ? "Attendance completed successfully"
          : `Attendance marked incomplete. Work ${(
              REQUIRED_HOURS - workedHours
            ).toFixed(2)} more hours`,
      data: attendance,
    });
  } catch (error) {
    console.error("End Attendance Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.userId; // from verifyToken middleware

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    console.log(imageUrl);
    // Update only imageUrl
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { imageUrl },
      { new: true, runValidators: true }
    ).select("-password");
    console.log(updatedUser);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update image error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    user.otp = otp;
    await user.save();

    // Send OTP email
    await sendEmail({
      from: {
        name: "HRMS Support",
        email: process.env.EMAIL_USER,
      },
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <p>Hello <b>${user.userName}</b>,</p>

        <p>Your One-Time Password (OTP) for password reset is:</p>

        <h2 style="letter-spacing:2px;">${otp}</h2>

        <p>This OTP is valid for one use only.</p>

        <br/>
        <a href="${process.env.FRONTEND_URI}/reset-password">Reset Password</a>
        <br/>
        <p>Regards,<br/>HRMS Team</p>
      `,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = ""; // clear OTP
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
  updateProfileImage,
  forgotPassword,
  resetPassword,
};

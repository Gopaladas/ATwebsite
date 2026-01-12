import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SuperAdmin", "Hr", "Manager", "Employee"],
      default: "Employee",
    },

    phoneNumber: String,
    department: String,

    isOnLeave: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    leaveCount: {
      type: Number,
      default: 0,
    },

    lastLoginAt: Date,

    // 🔗 Hierarchy references
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    hrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    imageUrl: String,

    bio: {
      type: String,
      default: "",
    },

    otp: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
export default User;

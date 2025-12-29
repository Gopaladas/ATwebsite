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
      enum: ["Employee", "Manager", "Hr"],
      default: "Employee",
    },
    phoneNumber: {
      type: String,
    },
    department: {
      type: String,
    },
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
    hrId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
export default User;

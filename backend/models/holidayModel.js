import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["National", "State", "Company"],
      default: "Company",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // HR who created
    },
  },
  { timestamps: true }
);

holidaySchema.index({ date: 1 }, { unique: true });

const Holiday = mongoose.model("Holiday", holidaySchema);
export default Holiday;

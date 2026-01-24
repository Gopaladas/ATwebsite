import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    text: { type: String },

    fileUrl: { type: String }, // 👈 Cloudinary URL
    fileType: {
      // 👈 image | video | document
      type: String,
      enum: ["image", "video", "document"],
    },

    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("ChatMessage", chatMessageSchema);

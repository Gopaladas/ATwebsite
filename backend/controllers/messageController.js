import ChatMessageModel from "../models/ChatMessageModel.js";
import User from "../models/userModel.js";
import { userSocketMap } from "../socket/socket.js";
import { getIO } from "../socket/socket.js";

// USERS SIDEBAR
export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.userId;

    const users = await User.find({ _id: { $ne: myId } }).select("-password");

    const unSeenMessages = {};

    for (let user of users) {
      const count = await ChatMessageModel.countDocuments({
        sender: user._id,
        receiver: myId,
        seen: false,
      });

      if (count > 0) unSeenMessages[user._id] = count;
    }

    res.json({ success: true, users, unSeenMessages });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// GET CHAT HISTORY
export const getMessages = async (req, res) => {
  try {
    const myId = req.userId;
    const otherId = req.params.id;

    const messages = await ChatMessageModel.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    await ChatMessageModel.updateMany(
      { sender: otherId, receiver: myId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.id;
    const { text, fileUrl, fileType } = req.body;

    const newMessage = await ChatMessageModel.create({
      sender: senderId,
      receiver: receiverId,
      text,
      fileUrl,
      fileType,
    });

    const io = getIO();
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

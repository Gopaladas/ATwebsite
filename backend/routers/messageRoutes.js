import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", verifyToken, getUsersForSidebar);
messageRouter.get("/:id", verifyToken, getMessages);
// messageRouter.put("/mark/:id", verifyToken, markMessageAsSeen);
messageRouter.post("/send/:id", verifyToken, sendMessage);
export default messageRouter;

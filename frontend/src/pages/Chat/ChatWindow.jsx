import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../socket";
import Message from "./Message";
import { CLOUD_NAME, messageURI, preset } from "../../mainApi";

// const CLOUD_NAME = "YOUR_CLOUD_NAME";
// const preset = "YOUR_UPLOAD_PRESET";

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    const loadMessages = async () => {
      const res = await axios.get(`${messageURI}/${selectedUser._id}`, {
        withCredentials: true,
      });
      setMessages(res.data.messages);
    };

    loadMessages();

    socket.on("newMessage", (msg) => {
      if (
        msg.sender === selectedUser._id ||
        msg.receiver === selectedUser._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("newMessage");
  }, [selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", preset);

    let fileType = "image";
    let resource = "image";

    if (file.type.startsWith("video")) {
      fileType = "video";
      resource = "video";
    } else if (file.type === "application/pdf") {
      // ✅ PDF MUST be image
      fileType = "document";
      resource = "raw";
    } else if (file.type.includes("word")) {
      // Word files cannot preview
      fileType = "document";
      resource = "raw";
    }

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`,
      data,
    );

    return { url: res.data.secure_url, type: fileType };
  };

  const handleFileSend = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("video") && file.size > 15 * 1024 * 1024) {
      alert("Video must be under 30 seconds");
      return;
    }

    const { url, type } = await uploadToCloudinary(file);

    const res = await axios.post(
      `${messageURI}/send/${selectedUser._id}`,
      { fileUrl: url, fileType: type },
      { withCredentials: true },
    );

    setMessages((prev) => [...prev, res.data.newMessage]);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await axios.post(
      `${messageURI}/send/${selectedUser._id}`,
      { text },
      { withCredentials: true },
    );

    setMessages((prev) => [...prev, res.data.newMessage]);
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="p-4 bg-white shadow flex items-center gap-3">
        <img
          src={selectedUser.imageUrl || "https://i.pravatar.cc/40"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-bold">{selectedUser.userName}</p>
          <p className="text-xs text-gray-500">{selectedUser.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <Message key={msg._id} msg={msg} myId={currentUser._id} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Type a message..."
        />

        <input
          type="file"
          hidden
          id="fileInput"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSend}
        />

        <button
          onClick={() => document.getElementById("fileInput").click()}
          className="px-3"
        >
          📎
        </button>

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-5 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

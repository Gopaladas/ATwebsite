import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import socket from "../socket";

const ChatPage = ({ user }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    console.log(user);
    if (!user?._id) return;
    console.log(user._id);
    socket.io.opts.query = { userId: user._id };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  return (
    <div className="flex h-full bg-slate-100 rounded-lg overflow-hidden">
      <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

      {selectedUser ? (
        <ChatWindow selectedUser={selectedUser} currentUser={user} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatPage;

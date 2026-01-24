import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import { messageURI } from "../../mainApi";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [unseen, setUnseen] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get(`${messageURI}/users`, {
          withCredentials: true,
        });

        setUsers(res.data.users || []);
        setUnseen(res.data.unSeenMessages || {});
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    loadUsers();

    socket.on("getOnlineUsers", setOnlineUsers);

    return () => {
      socket.off("getOnlineUsers");
    };
  }, []);

  // 🧠 Filter logic
  const filteredUsers = users.filter((u) => {
    const matchName = u.userName?.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    return matchName && matchRole;
  });

  return (
    <div className="w-80 bg-white border-r shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 text-lg font-bold text-indigo-600">Giant Chat</div>

      {/* 🔍 Filters */}
      <div className="p-3 space-y-2 border-b">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Roles</option>
          <option value="HR">HR</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-6">
            No users found
          </p>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => setSelectedUser(u)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 ${
              selectedUser?._id === u._id ? "bg-indigo-100" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={u.imageUrl || "https://i.pravatar.cc/40"}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />

              {/* Online dot */}
              {onlineUsers.includes(u._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold">{u.userName}</p>
              <p className="text-xs text-gray-500">{u.role}</p>
            </div>

            {/* Unseen count */}
            {unseen[u._id] && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                {unseen[u._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

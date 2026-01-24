import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  MessageCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import ManageHRs from "./ManageHRs";
import SuperAdminProfile from "./SuperAdminProfile";
import SettingsPage from "./Settings";
import ChatPage from "../../Chat/ChatPage";

import { superAdminURI, userURI } from "../../../mainApi";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);

  const navigate = useNavigate();

  /* ======================
     FETCH SUPER ADMIN PROFILE
  ======================= */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${superAdminURI}/me`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Super admin profile error", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ======================
     LOGOUT
  ======================= */
  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  /* ======================
     RENDER TAB CONTENT
  ======================= */
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "hrs":
        return <ManageHRs />;
      case "profile":
        return <SuperAdminProfile profile={profile} />;
      case "chat":
        return <ChatPage user={profile} />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= SIDEBAR ================= */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Super Admin Portal
          </h1>
        </div>

        <nav className="mt-6">
          <SidebarButton
            icon={<Home />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />

          <SidebarButton
            icon={<Users />}
            label="Manage HRs"
            active={activeTab === "hrs"}
            onClick={() => setActiveTab("hrs")}
          />

          <SidebarButton
            icon={<User />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />

          <SidebarButton
            icon={<MessageCircle />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />

          <SidebarButton
            icon={<Settings />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="ml-64 h-screen flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="p-6 border-b bg-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === "dashboard" && "Super Admin Dashboard"}
              {activeTab === "hrs" && "Manage HRs"}
              {activeTab === "profile" && "Profile"}
              {activeTab === "chat" && "Chat"}
              {activeTab === "settings" && "Settings"}
            </h1>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-full">
                <div className="relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

/* ======================
   SIDEBAR BUTTON
====================== */
const SidebarButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
      active
        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
        : "text-gray-600"
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </button>
);

export default SuperAdminDashboard;

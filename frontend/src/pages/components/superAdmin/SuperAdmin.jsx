import React, { useState, useEffect } from "react";
import { Users, Home, LogOut, User, Settings } from "lucide-react";
import Dashboard from "./Dashboard";
import ManageHRs from "./ManageHRs";
import SuperAdminProfile from "./SuperAdminProfile";
import SettingsPage from "./Settings";
import axios from "axios";
import { superAdminURI, userURI } from "../../../mainApi";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.get(`${userURI}/logout`, { withCredentials: true });
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "hrs":
        return <ManageHRs />;
      case "profile":
        return <SuperAdminProfile />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <h1 className="text-xl font-bold p-6 text-blue-600">Super Admin</h1>

        <nav className="space-y-2 px-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex gap-2 w-full p-2 hover:bg-blue-50"
          >
            <Home /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab("hrs")}
            className="flex gap-2 w-full p-2 hover:bg-blue-50"
          >
            <Users /> Manage HRs
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className="flex gap-2 w-full p-2 hover:bg-blue-50"
          >
            <User /> Profile
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="flex gap-2 w-full p-2 hover:bg-blue-50"
          >
            <Settings /> Settings
          </button>
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
};

export default SuperAdminDashboard;

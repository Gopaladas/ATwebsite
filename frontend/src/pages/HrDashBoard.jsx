import React, { useState } from "react";
import {
  User,
  Users,
  Calendar,
  Settings,
  LogOut,
  Search,
  Bell,
  Home,
  Clock,
  CalendarDays,
} from "lucide-react";
import Dashboard from "./components/hr/Dashboard";
import HRProfile from "./components/hr/HrProfile";
import ManageManagers from "./components/hr/ManageManagers";
import Attendance from "./components/hr/Attendance";
import Leaves from "./components/hr/Leaves";
import SettingsPage from "./components/hr/Settings";
import { mockManagers, mockAttendance, mockLeaves } from "../utils/data";
import axios from "axios";
import { hrURI, userURI } from "../mainApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [managers, setManagers] = useState(mockManagers);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState(mockLeaves);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("HrToken");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${hrURI}/getManagers`, {
        withCredentials: true,
      });

      console.log(res);

      const formattedManagers = res.data.data.map((m) => ({
        id: m._id,
        name: m.userName,
        email: m.email,
        department: m.department || "N/A",
        avatar: m.imageUrl || "",
        employees: 0, // later can be calculated
        status: m.isActive ? "active" : "inactive",
      }));

      setManagers(formattedManagers);
    } catch (error) {
      console.error("Error fetching managers", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      // const today = new Date().toISOString().split("T")[0];

      const res = await axios.get(`${hrURI}/manager-attendance`, {
        withCredentials: true,
      });

      console.log(res);

      const formatted = res.data.data.map((att) => ({
        id: att._id,
        name: att.userId?.userName || "Unknown",
        date: att.date,
        status: att.status,
        checkIn: att.startTime,
        checkOut: att.endTime,
        department: att.userId?.department || "N/A",
      }));

      setAttendance(formatted);
    } catch (err) {
      console.error("Attendance fetch error", err);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchAttendance();
  }, []);

  const handleActivateManager = async (id) => {
    try {
      await axios.patch(
        `${hrURI}/activateManager/${id}`,
        { isActive: true },
        { withCredentials: true }
      );

      await fetchManagers();

      setManagers((prev) =>
        prev.map((manager) =>
          manager._id === id ? { ...manager, isActive: true } : manager
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to activate manager");
    }
  };

  const handleDeactivateManager = async (id) => {
    try {
      await axios.patch(
        `${hrURI}/deleteManager/${id}`,
        { isActive: false },
        { withCredentials: true }
      );

      await fetchManagers();
      setManagers((prev) =>
        prev.map((manager) =>
          manager._id === id ? { ...manager, isActive: false } : manager
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to deactivate manager");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${userURI}/logout`, {
        withCredentials: true,
      });
      console.log(res);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            attendance={attendance}
            leaves={leaves}
            managers={managers}
          />
        );
      case "profile":
        return <HRProfile />;
      case "managers":
        return (
          <ManageManagers
            managers={managers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleActivateManager={handleActivateManager}
            handleDeactivateManager={handleDeactivateManager}
          />
        );
      case "attendance":
        return (
          <Attendance
            attendance={attendance}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        );
      case "leaves":
        return <Leaves leaves={leaves} />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard attendance={attendance} leaves={leaves} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">HR Portal</h1>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "profile"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab("managers")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "managers"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <Users className="w-5 h-5" />
            Manage Managers
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "attendance"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <Clock className="w-5 h-5" />
            Attendance
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "leaves"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            Leaves
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-50 hover:text-blue-600 ${
              activeTab === "settings"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
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

      {/* Main Content */}
      <div className="ml-64 p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === "dashboard" && "HR Dashboard"}
              {activeTab === "profile" && "Profile"}
              {activeTab === "managers" && "Manage Managers"}
              {activeTab === "attendance" && "Attendance Management"}
              {activeTab === "leaves" && "Leave Management"}
              {activeTab === "settings" && "Settings"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <div className="relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default HRDashboard;

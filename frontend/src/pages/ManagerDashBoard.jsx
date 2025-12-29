import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Home,
  Clock,
  CalendarDays,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { managerURI, userURI } from "../mainApi";

import ManagerDashboard from "./components/manager/ManagerDashboard";
import ManagerProfile from "./components/manager/ManagerProfile";
import MyTeam from "./components/manager/MyTeam";
import TeamAttendance from "./components/manager/TeamAttendance";
import TeamLeaves from "./components/manager/TeamLeaves";
import ManagerSettings from "./components/manager/ManagerSettings";
import ManagerAttendance from "./components/manager/ManagerAttendance";
import ManagerLeaves from "./components/manager/ManagerLeaves";

const ManagerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeam();
    fetchAttendance();
    fetchLeaves();
  }, []);

  /* ================= TEAM ================= */
  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${managerURI}/employees`, {
        withCredentials: true,
      });

      const formatted = res.data.data.map((emp) => ({
        id: emp._id,
        name: emp.userName,
        email: emp.email,
        department: emp.department || "N/A",
        imageUrl: emp.imageUrl,
        status: emp.isActive ? "active" : "inactive",
        joinDate: new Date(emp.createdAt).toISOString().split("T")[0],
      }));

      setTeam(formatted);
    } catch (err) {
      console.error("Team fetch error", err);
    }
  };

  /* ================= ATTENDANCE ================= */
  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await axios.get(
        `${managerURI}/team-attendance?date=${today}`,
        { withCredentials: true }
      );

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

  /* ================= LEAVES ================= */
  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${managerURI}/team-leaves`, {
        withCredentials: true,
      });

      const formatted = res.data.data.map((leave) => ({
        id: leave._id,
        name: leave.user?.userName || "Unknown",
        type: leave.leaveType,
        from: new Date(leave.fromDate).toISOString().split("T")[0],
        to: new Date(leave.toDate).toISOString().split("T")[0],
        status: leave.status,
      }));

      setLeaves(formatted);
    } catch (err) {
      console.error("Leave fetch error", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  /* ================= RENDER ================= */
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ManagerDashboard
            team={team}
            attendance={attendance}
            leaves={leaves}
          />
        );
      case "profile":
        return <ManagerProfile />;
      case "myteam":
        return (
          <MyTeam
            team={team}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fetchTeam={fetchTeam}
          />
        );
      case "myattendance":
        return <ManagerAttendance />;
      case "myleaves":
        return <ManagerLeaves />;
      case "attendance":
        return <TeamAttendance attendance={attendance} />;
      case "leaves":
        return <TeamLeaves leaves={leaves} />;
      case "settings":
        return <ManagerSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r">
        <div className="p-6 text-xl font-bold text-green-600">
          Manager Portal
        </div>

        <nav>
          {[
            ["dashboard", Home, "Dashboard"],
            ["profile", User, "Profile"],
            ["myteam", Users, "My Team"],
            ["myattendance", Clock, "My attendance"],
            ["myleaves", CalendarDays, "My leaves"],
            ["attendance", Clock, "Attendance"],
            ["leaves", CalendarDays, "Leaves"],
            ["settings", Settings, "Settings"],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-6 py-3 ${
                activeTab === key
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 p-6">
        <header className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Bell className="w-6 h-6" />
          </div>
        </header>

        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerDashboardPage;

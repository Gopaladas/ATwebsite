import React, { useState, useEffect } from "react";
import {
  User,
  Home,
  Clock,
  CalendarDays,
  FileText,
  LogOut,
  Search,
  Bell,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { employeeURI, userURI } from "../mainApi";

import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeeAttendance from "./components/employee/EmployeeAttendance";
import EmployeeLeaves from "./components/employee/EmployeeLeaves";
import EmployeeDocuments from "./components/employee/EmployeeDocuments";

const EmployeeDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${employeeURI}/profile`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, leavesRes, holidaysRes] = await Promise.all([
        axios.get(`${employeeURI}/attendance`, { withCredentials: true }),
        axios.get(`${employeeURI}/leaves`, { withCredentials: true }),
        axios.get(`${employeeURI}/holidays`, {
          params: { year: new Date().getFullYear() },
          withCredentials: true,
        }),
      ]);

      console.log(attendanceRes, leavesRes, holidaysRes);
      setAttendance(attendanceRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
      setHolidays(holidaysRes.data.data || []);
    } catch (err) {
      console.error("Dashboard data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <EmployeeDashboard
            profile={profile}
            attendance={attendance}
            leaves={leaves}
            holidays={holidays}
            fetchDashboardData={fetchDashboardData}
          />
        );
      case "profile":
        return (
          <EmployeeProfile profile={profile} fetchProfile={fetchProfile} />
        );
      case "attendance":
        return <EmployeeAttendance attendance={attendance} />;
      case "leaves":
        return (
          <EmployeeLeaves
            leaves={leaves}
            fetchDashboardData={fetchDashboardData}
          />
        );
      case "documents":
        return <EmployeeDocuments />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-sm">
        <div className="p-6 text-xl font-bold text-blue-600">
          Employee Portal
        </div>

        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img
              src={profile?.imageUrl}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {profile?.userName || "Employee"}
              </h3>
              <p className="text-sm text-gray-500">
                {profile?.department || "Department"}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {[
            ["dashboard", Home, "Dashboard"],
            ["profile", User, "My Profile"],
            ["attendance", Clock, "Attendance"],
            ["leaves", CalendarDays, "My Leaves"],
            ["documents", FileText, "Documents"],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg ${
                activeTab === key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold capitalize">
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab.replace("-", " ")}
            </h1>
            <p className="text-gray-500">
              Welcome back, {profile?.userName || "Employee"}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="relative p-2">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  FileText,
  User,
} from "lucide-react";
import axios from "axios";
import { employeeURI, userURI } from "../../../mainApi";

const EmployeeDashboard = ({
  profile,
  attendance,
  leaves,
  holidays,
  fetchDashboardData,
}) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    leaveType: "CASUAL",
  });

  const todayAttendance = attendance.find(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );

  const handleCheckIn = async () => {
    try {
      await axios.post(
        `${employeeURI}/attendance/check-in`,
        {},
        { withCredentials: true }
      );
      alert("Checked in successfully!");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to check in");
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post(
        `${userURI}/attendance/check-out`,
        {},
        { withCredentials: true }
      );
      alert("Checked out successfully!");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to check out");
      console.error(err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${userURI}/apply-leave`, leaveForm, {
        withCredentials: true,
      });
      alert("Leave applied successfully!");
      setShowLeaveModal(false);
      setLeaveForm({
        reason: "",
        fromDate: "",
        toDate: "",
        leaveType: "CASUAL",
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Working Days</p>
              <p className="text-2xl font-bold mt-2">
                {attendance.filter((a) => a.status === "Present").length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Leaves Taken</p>
              <p className="text-2xl font-bold mt-2">
                {leaves.filter((l) => l.status === "APPROVED").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Leaves</p>
              <p className="text-2xl font-bold mt-2">
                {leaves.filter((l) => l.status === "PENDING").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Holidays</p>
              <p className="text-2xl font-bold mt-2">
                {holidays.filter((h) => new Date(h.date) > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Check-in/out & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Today's Status</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  {todayAttendance
                    ? `You're marked as ${todayAttendance.status} today`
                    : "No attendance recorded for today"}
                </p>
                {todayAttendance && (
                  <div className="mt-2 text-sm">
                    <p>
                      Check-in: {todayAttendance.startTime || "Not recorded"}
                    </p>
                    <p>
                      Check-out: {todayAttendance.endTime || "Not recorded"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {!todayAttendance?.startTime ? (
                  <button
                    onClick={handleCheckIn}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Check In
                  </button>
                ) : !todayAttendance?.endTime ? (
                  <button
                    onClick={handleCheckOut}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Check Out
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 rounded-lg">
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Check In</th>
                    <th className="text-left py-3">Check Out</th>
                    <th className="text-left py-3">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 5).map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{record.date}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3">{record.startTime || "-"}</td>
                      <td className="py-3">{record.endTime || "-"}</td>
                      <td className="py-3">{record.totalHours || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Upcoming Holidays */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50"
              >
                <span>Apply for Leave</span>
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50">
                <span>Download Payslip</span>
                <FileText className="w-5 h-5" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50">
                <span>Update Profile</span>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Upcoming Holidays</h3>
            <div className="space-y-3">
              {holidays
                .filter((h) => new Date(h.date) > new Date())
                .slice(0, 3)
                .map((holiday) => (
                  <div key={holiday._id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(holiday.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={leaveForm.fromDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, fromDate: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={leaveForm.toDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, toDate: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;

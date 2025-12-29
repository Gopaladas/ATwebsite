import React, { useState } from "react";
import { Calendar, Clock, XCircle, CheckCircle, Plus } from "lucide-react";
import axios from "axios";
import { employeeURI, userURI } from "../../../mainApi";

const EmployeeLeaves = ({ leaves, fetchDashboardData }) => {
  const [showForm, setShowForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    leaveType: "CASUAL",
  });

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${employeeURI}/leaveapply`, leaveForm, {
        withCredentials: true,
      });
      alert("Leave applied successfully!");
      setShowForm(false);
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

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm("Are you sure you want to cancel this leave?")) {
      try {
        await axios.delete(`${employeeURI}/cancel-leave/${leaveId}`, {
          withCredentials: true,
        });
        fetchDashboardData();
        alert("Leave cancelled successfully");
      } catch (err) {
        alert("Failed to cancel leave");
      }
    }
  };

  const leaveStats = {
    total: leaves.length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leaves</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Leaves</p>
              <p className="text-2xl font-bold mt-2">{leaveStats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Approved</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {leaveStats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">
                {leaveStats.pending}
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
              <p className="text-gray-500">Rejected</p>
              <p className="text-2xl font-bold mt-2 text-red-600">
                {leaveStats.rejected}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Apply for Leave</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
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
              <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Please mention the reason for leave..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6">Leave Type</th>
                <th className="text-left py-4 px-6">From - To</th>
                <th className="text-left py-4 px-6">Duration</th>
                <th className="text-left py-4 px-6">Reason</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Applied On</th>
                <th className="text-left py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => {
                  const fromDate = new Date(leave.fromDate);
                  const toDate = new Date(leave.toDate);
                  const duration =
                    Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave._id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-medium">{leave.leaveType}</span>
                      </td>
                      <td className="py-4 px-6">
                        {fromDate.toLocaleDateString()} -{" "}
                        {toDate.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">{duration} day(s)</td>
                      <td className="py-4 px-6">{leave.reason}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            leave.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : leave.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {leave.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaves;

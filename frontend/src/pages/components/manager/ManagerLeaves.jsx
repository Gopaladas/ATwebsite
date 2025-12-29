import React, { useEffect, useState } from "react";
import { Calendar, Clock, XCircle, CheckCircle, Plus } from "lucide-react";
import axios from "axios";
import { managerURI } from "../../../mainApi";

const ManagerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    leaveType: "CASUAL",
  });

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get(`${managerURI}/getMyLeaves`, {
        withCredentials: true,
      });

      //   console.log(res);
      setLeaves(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  /* ---------------- APPLY LEAVE ---------------- */
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${managerURI}/applyLeave`, leaveForm, {
        withCredentials: true,
      });

      console.log(res);
      alert("Leave request sent to HR");
      setShowForm(false);
      setLeaveForm({
        reason: "",
        fromDate: "",
        toDate: "",
        leaveType: "CASUAL",
      });

      //   fetchDashboardData();
      fetchMyLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  /* ---------------- CANCEL LEAVE ---------------- */
  //   const handleCancelLeave = async (leaveId) => {
  //     if (!window.confirm("Cancel this leave request?")) return;

  //     try {
  //       await axios.delete(`${managerURI}/leave/cancel/${leaveId}`, {
  //         withCredentials: true,
  //       });

  //       alert("Leave cancelled successfully");
  //       fetchDashboardData();
  //     } catch (err) {
  //       alert("Failed to cancel leave");
  //     }
  //   };

  /* ---------------- LEAVE STATS ---------------- */
  const leaveStats = {
    total: leaves?.length,
    approved: leaves?.filter((l) => l.status === "APPROVED").length,
    pending: leaves?.filter((l) => l.status === "PENDING").length,
    rejected: leaves?.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leaves</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total"
          value={leaveStats.total}
          icon={<Calendar className="text-blue-600" />}
        />
        <StatCard
          title="Approved"
          value={leaveStats.approved}
          icon={<CheckCircle className="text-green-600" />}
        />
        <StatCard
          title="Pending"
          value={leaveStats.pending}
          icon={<Clock className="text-yellow-600" />}
        />
        <StatCard
          title="Rejected"
          value={leaveStats.rejected}
          icon={<XCircle className="text-red-600" />}
        />
      </div>

      {/* APPLY FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Apply Leave</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <select
                className="w-full border p-2 rounded-lg"
                value={leaveForm.leaveType}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                }
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  required
                  className="border p-2 rounded-lg"
                  value={leaveForm.fromDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, fromDate: e.target.value })
                  }
                />
                <input
                  type="date"
                  required
                  className="border p-2 rounded-lg"
                  value={leaveForm.toDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, toDate: e.target.value })
                  }
                />
              </div>

              <textarea
                rows={3}
                required
                className="w-full border p-2 rounded-lg"
                placeholder="Reason"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Type",
                "From - To",
                "Duration",
                "Reason",
                "Status",
                "Applied On",
                "Action",
              ].map((h) => (
                <th key={h} className="px-6 py-4 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leaves?.length ? (
              leaves?.map((leave) => {
                const from = new Date(leave.fromDate);
                const to = new Date(leave.toDate);
                const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={leave._id} className="border-t">
                    <td className="px-6 py-4">{leave.leaveType}</td>
                    <td className="px-6 py-4">
                      {from.toLocaleDateString()} - {to.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{days} day(s)</td>
                    <td className="px-6 py-4">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          leave.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          className="text-red-600 hover:underline"
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
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No leave records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- STAT CARD ---------- */
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between">
    <div>
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
  </div>
);

export default ManagerLeaves;

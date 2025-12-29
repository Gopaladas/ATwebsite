import React, { useEffect, useState } from "react";
import { hrURI } from "../../../mainApi";
import axios from "axios";

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const fetchTeamLeaves = async () => {
    try {
      const res = await axios.get(`${hrURI}/getTeamLeaves`, {
        withCredentials: true,
      });
      console.log(res);
      setLeaves(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const handleApproveLeave = async (id) => {
    try {
      const res = await axios.patch(
        `${hrURI}/leaves/${id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchTeamLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelLeave = async (id) => {
    try {
      const res = await axios.patch(
        `${hrURI}/leaves/${id}/reject`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchTeamLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manager Leaves</h2>

      <div className="flex flex-col">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-4">Leave Statistics</h3>
            <div className="flex justify-around space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Leaves This Month</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6">Name</th>
                  <th className="text-left py-4 px-6">Leave Type</th>
                  <th className="text-left py-4 px-6">From - To</th>
                  <th className="text-left py-4 px-6">Status</th>
                  <th className="text-left py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={leave?.user?.imageUrl}
                          alt={leave.user?.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{leave.user?.userName}</p>
                          <p className="text-sm text-gray-500">
                            {leave.user?.department}
                          </p>
                          <p className="text-sm text-gray-500">
                            {leave.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{leave.leaveType}</td>
                    <td className="py-4 px-6">
                      {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>

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
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveLeave(leave._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500">Action taken</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;

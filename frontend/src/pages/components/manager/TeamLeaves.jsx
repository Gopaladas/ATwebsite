import React, { useState, useEffect } from "react";
import axios from "axios";
import { managerURI, userURI } from "../../../mainApi";

const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${managerURI}/team-leaves`, {
        withCredentials: true,
      });
      // console.log(res);
      setLeaves(res.data.data || []);
    } catch (error) {
      console.error("Error fetching leaves", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await axios.patch(
        `${managerURI}/leaves/${leaveId}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchLeaves();
    } catch (error) {
      console.error("Error approving leave", error);
      alert("Failed to approve leave");
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await axios.patch(
        `${managerURI}/leaves/${leaveId}/reject`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchLeaves();
    } catch (error) {
      console.error("Error rejecting leave", error);
      alert("Failed to reject leave");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Leave Requests</h2>

      <div className="flex flex-col gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-4">Leave Statistics</h3>
            <div className="flex justify-around gap-6">
              <div>
                <p className="text-sm text-gray-500">Total Leave Requests</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {leaves.filter((l) => l.status === "APPROVED").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {leaves.filter((l) => l.status === "PENDING").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {leaves.filter((l) => l.status === "REJECTED").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6">Employee</th>
                    <th className="text-left py-4 px-6">Leave Type</th>
                    <th className="text-left py-4 px-6">Reason</th>
                    <th className="text-left py-4 px-6">From - To</th>
                    <th className="text-left py-4 px-6">Status</th>
                    <th className="text-left py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map((leave) => (
                      <tr key={leave._id} className="border-t hover:bg-gray-50">
                        <td className="py-4 px-6">
                          {/* {console.log(leave)} */}
                          <div className="flex items-center gap-3">
                            <img
                              src={leave?.user?.imageUrl}
                              alt={leave.user?.userName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">
                                {leave.user?.userName}
                              </p>
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
                        <td className="py-4 px-6">{leave.reason}</td>
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
                                onClick={() => handleRejectLeave(leave._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">Action taken</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-500"
                      >
                        No leave requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLeaves;

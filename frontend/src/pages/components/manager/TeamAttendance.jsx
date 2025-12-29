import React, { useState, useEffect } from "react";
import { Download, Eye, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { managerURI, userURI } from "../../../mainApi";

const TeamAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${managerURI}/team-attendance`, {
        params: { date: selectedDate },
        withCredentials: true,
      });
      // console.log(res);
      setAttendance(res.data.data || []);
    } catch (error) {
      console.error("Error fetching attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleMarkAttendance = async (id, status) => {
    try {
      await axios.post(
        `${userURI}/mark-attendance`,
        {
          employeeId: id,
          date: selectedDate,
          status,
        },
        {
          withCredentials: true,
        }
      );
      fetchAttendance();
      alert(`Attendance marked as ${status}`);
    } catch (error) {
      console.error("Error marking attendance", error);
      alert("Failed to mark attendance");
    }
  };

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Attendance</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

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
                <th className="text-left py-4 px-6">Date</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Check In</th>
                <th className="text-left py-4 px-6">Check Out</th>
                <th className="text-left py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">
                      {console.log(record)}
                      <div className="flex items-center gap-3">
                        <img
                          src={record?.userId.imageUrl}
                          alt={record?.userId?.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">
                            {record.employeeId?.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.employeeId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{record.date}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "absent"
                            ? "bg-red-100 text-red-800"
                            : record.status === "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.status || "Not marked"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {formatTime(record.startTime)}
                    </td>
                    <td className="py-4 px-6">{formatTime(record.endTime)}</td>

                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleMarkAttendance(
                              record.employeeId?._id,
                              "present"
                            )
                          }
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            handleMarkAttendance(
                              record.employeeId?._id,
                              "absent"
                            )
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() =>
                            handleMarkAttendance(record.employeeId?._id, "late")
                          }
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No attendance records found for {selectedDate}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;

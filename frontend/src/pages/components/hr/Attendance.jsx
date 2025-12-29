import React from "react";
import { Download, Eye, CheckCircle, XCircle } from "lucide-react";

const Attendance = ({ attendance, selectedDate, setSelectedDate }) => {
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
        <h2 className="text-2xl font-bold">Manager Attendance</h2>
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

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-6">Name</th>
              <th className="text-left py-4 px-6">Date</th>
              <th className="text-left py-4 px-6">Status</th>
              <th className="text-left py-4 px-6">Check In</th>
              <th className="text-left py-4 px-6">Check Out</th>
              {/* <th className="text-left py-4 px-6">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="border-t hover:bg-gray-50">
                <td className="py-4 px-6">{record.name}</td>
                <td className="py-4 px-6">{record.date}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === "present"
                        ? "bg-green-100 text-green-800"
                        : record.status === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="py-4 px-6">{formatTime(record.checkIn)}</td>
                <td className="py-4 px-6">{formatTime(record.checkOut)}</td>
                {/* <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

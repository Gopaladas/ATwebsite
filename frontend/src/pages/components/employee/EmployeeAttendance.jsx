import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { employeeURI, userURI, CLOUD_NAME, preset } from "../../../mainApi";

const EmployeeAttendance = () => {
  /* -------------------- ATTENDANCE DATA -------------------- */
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${employeeURI}/attendance`, {
        withCredentials: true,
      });
      setAttendance(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* -------------------- CAMERA STATES -------------------- */
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState(null); // START | END
  const [loading, setLoading] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /* -------------------- CAPTURE & SEND -------------------- */
  const captureAndSend = async () => {
    setShutter(true);
    setTimeout(() => setShutter(false), 150);
    setLoading(true);
    setMessage({ type: "", text: "" });

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setMessage({ type: "error", text: "Camera capture failed" });
      setLoading(false);
      return;
    }

    try {
      // 📸 Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", imageSrc);
      formData.append("upload_preset", preset);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const endpoint = attendanceType === "START" ? "/start" : "/end";

      const res = await axios.post(
        `${userURI}${endpoint}`,
        {
          imageUrl: cloudinaryRes.data.secure_url,
        },
        { withCredentials: true }
      );

      // ✅ HANDLE REAL BACKEND RESPONSE
      if (res.data.status === "INCOMPLETE") {
        setMessage({
          type: "warning",
          text: res.data.message,
        });
      } else {
        setMessage({
          type: "success",
          text: res.data.message || "Attendance recorded successfully",
        });
      }

      setShowCamera(false);
      fetchAttendance();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Attendance submission failed";

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- FILTER + STATS -------------------- */
  const filteredAttendance = attendance.filter((a) =>
    a.date.startsWith(selectedMonth)
  );

  const stats = {
    present: filteredAttendance.filter((a) => a.status === "Present").length,
    absent: filteredAttendance.filter((a) => a.status === "Absent").length,
    late: filteredAttendance.filter((a) => a.status === "Late").length,
    hours: filteredAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6 space-y-10">
      {/* ================= CAMERA POPUP ================= */}
      {showCamera && (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4">
            {attendanceType === "START" ? "Check-in Photo" : "Check-out Photo"}
          </h2>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-white transition-opacity ${
                shutter ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <button
            onClick={captureAndSend}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg"
          >
            Capture & Submit
          </button>
        </div>
      )}

      {/* ================= ACTION BUTTONS ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl mx-auto">
        {message.text && (
          <p
            className={`text-center mb-3 ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => {
              setAttendanceType("START");
              setShowCamera(true);
            }}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg"
          >
            Start Attendance
          </button>

          <button
            onClick={() => {
              setAttendanceType("END");
              setShowCamera(true);
            }}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
          >
            End Attendance
          </button>
        </div>
      </div>

      {/* ================= ATTENDANCE REPORT ================= */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Attendance</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Present", stats.present, "green", CheckCircle],
            ["Absent", stats.absent, "red", XCircle],
            ["Late", stats.late, "yellow", Clock],
            ["Hours", stats.hours.toFixed(1), "blue", TrendingUp],
          ].map(([label, value, , Icon]) => (
            <div
              key={label}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Date",
                  "Day",
                  "Status",
                  "Check In",
                  "Check Out",
                  "Hours",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-6 py-4">{a.date}</td>
                  <td className="px-6 py-4">
                    {new Date(a.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">{a.status}</td>
                  <td className="px-6 py-4">{a.startTime || "-"}</td>
                  <td className="px-6 py-4">{a.endTime || "-"}</td>
                  <td className="px-6 py-4">{a.totalHours || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;

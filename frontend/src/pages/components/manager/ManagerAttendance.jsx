import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Clock, CheckCircle, XCircle, TrendingUp, Send } from "lucide-react";
import { managerURI, userURI, CLOUD_NAME, preset } from "../../../mainApi";

const ManagerAttendance = () => {
  /* -------------------- ATTENDANCE DATA -------------------- */
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${managerURI}/getMyAttendance`, {
        withCredentials: true,
      });
      //   console.log(res);
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
      const formData = new FormData();
      formData.append("file", imageSrc);
      formData.append("upload_preset", preset);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const endpoint = attendanceType === "START" ? "/start" : "/end";

      const res = await axios.post(
        `${userURI}${endpoint}`,
        { imageUrl: cloudRes.data.secure_url },
        { withCredentials: true }
      );

      setMessage({
        type: "success",
        text: res.data.message,
      });

      setShowCamera(false);
      fetchAttendance();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Attendance failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- SUBMIT TO HR -------------------- */
  //   const submitToHR = async () => {
  //     try {
  //       const res = await axios.post(
  //         `${managerURI}/attendance/submit`,
  //         {},
  //         { withCredentials: true }
  //       );

  //       alert(res.data.message);
  //       fetchAttendance();
  //     } catch (err) {
  //       alert(err.response?.data?.message || "Submission failed");
  //     }
  //   };

  /* -------------------- FILTER + STATS -------------------- */
  const filteredAttendance = attendance.filter((a) =>
    a.date.startsWith(selectedMonth)
  );

  const stats = {
    present: filteredAttendance.filter((a) => a.status === "Present").length,
    hours: filteredAttendance.reduce((s, a) => s + (a.totalHours || 0), 0),
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-10">
      {/* CAMERA */}
      {showCamera && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4">
            {attendanceType === "START" ? "Check-in" : "Check-out"}
          </h2>

          <div className="relative bg-black aspect-video mb-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-white ${
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

      {/* ACTION BUTTONS */}
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
        {message.text && (
          <p className="text-center mb-4 text-green-600">{message.text}</p>
        )}

        <div className="flex gap-4 mb-4">
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

        {/* 🔥 SUBMIT TO HR */}
        {/* <button
          onClick={submitToHR}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Send size={18} /> Submit Attendance to HR
        </button> */}
      </div>

      {/* REPORT */}
      <div className="bg-white rounded-xl shadow border">
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
                // "HR Status",
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
                <td className="px-6 py-4">
                  {a.startTime
                    ? new Date(a.startTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  {a.endTime ? new Date(a.endTime).toLocaleTimeString() : "-"}
                </td>
                <td className="px-6 py-4">{a.totalHours}</td>
                {/* <td className="px-6 py-4">
                  {a.hrApprovalStatus || "Not Submitted"}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerAttendance;

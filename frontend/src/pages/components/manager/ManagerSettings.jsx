import React, { useState, useEffect } from "react";
import axios from "axios";
import { userURI } from "../../../mainApi";

const ManagerSettings = () => {
  const [holidays, setHolidays] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    attendanceReminders: true,
    leaveApprovalAlerts: true,
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const res = await axios.get(`${userURI}/getPublicHolidays`, {
        params: { year: currentYear },
        withCredentials: true,
      });
      // console.log(res.data);
      setHolidays(res.data || []);
    } catch (error) {
      console.error("Error fetching holidays", error);
    }
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive email notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={() =>
                      handleNotificationChange("emailNotifications")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Attendance Reminders</p>
                  <p className="text-sm text-gray-600">
                    Send daily reminders to team
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.attendanceReminders}
                    onChange={() =>
                      handleNotificationChange("attendanceReminders")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Approval Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified for new leave requests
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.leaveApprovalAlerts}
                    onChange={() =>
                      handleNotificationChange("leaveApprovalAlerts")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Upcoming Holidays</h3>
          <div className="space-y-3">
            {holidays.length > 0 ? (
              holidays.slice(0, 5).map((holiday) => (
                <div
                  key={holiday._id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  {console.log(holiday)}
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(holiday.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      holiday.type === "public"
                        ? "bg-purple-100 text-purple-800"
                        : holiday.type === "company"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {holiday.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No holidays scheduled
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;

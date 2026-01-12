import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";

const SettingsPage = () => {
  const [holidayData, setHolidayData] = useState({
    name: "",
    date: "",
    type: "PUBLIC",
  });

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Fetch holidays
  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${hrURI}/holidays`, {
        withCredentials: true,
      });
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error("Fetch holidays failed", err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post(`${hrURI}/addHoliday`, holidayData, {
        withCredentials: true,
      });

      setMessage(res.data.message);
      setHolidayData({ name: "", date: "", type: "PUBLIC" });
      fetchHolidays(); // 🔥 refresh list
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Add Holiday */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4">Add Holiday (HR Only)</h3>

        {message && (
          <p className="text-sm text-center text-blue-600 mb-4">{message}</p>
        )}

        <form onSubmit={handleAddHoliday} className="space-y-4">
          <input
            type="text"
            placeholder="Holiday name"
            value={holidayData.name}
            onChange={(e) =>
              setHolidayData({ ...holidayData, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="date"
            value={holidayData.date}
            onChange={(e) =>
              setHolidayData({ ...holidayData, date: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <select
            value={holidayData.type}
            onChange={(e) =>
              setHolidayData({ ...holidayData, type: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="PUBLIC">Public Holiday</option>
            <option value="COMPANY">Company Holiday</option>
            <option value="OPTIONAL">Optional Holiday</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Holiday"}
          </button>
        </form>
      </div>

      {/* 🔹 Holiday List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4">Holiday List</h3>

        {holidays.length === 0 ? (
          <p className="text-gray-500 text-sm">No holidays added yet</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h._id} className="border-t">
                  <td className="p-3">{h.name}</td>
                  <td className="p-3">
                    {new Date(h.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 capitalize">{h.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;

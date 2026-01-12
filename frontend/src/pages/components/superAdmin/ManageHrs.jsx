import React, { useEffect, useState } from "react";
import axios from "axios";
import { superAdminURI } from "../../../mainApi";

const ManageHRs = () => {
  const [hrs, setHrs] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const fetchHRs = async () => {
    const res = await axios.get(`${superAdminURI}/hrs`, {
      withCredentials: true,
    });
    setHrs(res.data.data);
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const createHR = async (e) => {
    e.preventDefault();
    await axios.post(`${superAdminURI}/create-hr`, form, {
      withCredentials: true,
    });
    fetchHRs();
  };

  const toggleStatus = async (id, isActive) => {
    try {
      const url = isActive
        ? `${superAdminURI}/hr/deactivate/${id}`
        : `${superAdminURI}/hr/activate/${id}`;

      await axios.put(url, {}, { withCredentials: true });

      fetchHRs(); // refresh list
    } catch (error) {
      console.error("Toggle HR error:", error);
      alert(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage HRs</h2>

      {/* Create HR */}
      <form onSubmit={createHR} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Name"
            required
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
          />
          <input
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            placeholder="Phone"
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Create HR
        </button>
      </form>

      {/* HR List */}
      <div className="bg-white rounded shadow">
        {hrs.map((hr) => (
          <div key={hr._id} className="flex justify-between p-4 border-b">
            <div>
              <p className="font-semibold">{hr.userName}</p>
              <p className="text-sm text-gray-500">{hr.email}</p>
            </div>

            <button
              onClick={() => toggleStatus(hr._id, hr.isActive)}
              className={`px-3 py-1 rounded cursor-pointer transition ${
                hr.isActive
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              {hr.isActive ? "deActivate" : "activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageHRs;

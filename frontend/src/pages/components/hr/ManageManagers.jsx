import React, { useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { hrURI, userURI } from "../../../mainApi";

const ManageManagers = ({
  managers,
  searchTerm,
  setSearchTerm,
  handleActivateManager,
  handleDeactivateManager,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    department: "",
  });

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${userURI}/register`, formData, {
        withCredentials: true,
      });

      setFormOpen(false);
      setFormData({
        userName: "",
        email: "",
        password: "",
        phoneNumber: "",
        department: "",
      });

      window.location.reload(); // simple refresh
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Managers</h2>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Manager
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search managers..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Manager Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManagers.map((manager) => (
          <div
            key={manager.id}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            {console.log(manager)}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={manager.avatar}
                alt={manager.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{manager.name}</h3>
                <p className="text-sm text-gray-500">{manager.department}</p>
                <p className="text-xs text-gray-400">{manager.email}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="font-semibold">{manager.employees} employees</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  manager.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {manager.status}
              </span>
            </div>

            <div className="flex gap-2">
              {manager.status === "active" ? (
                <button
                  onClick={() => handleDeactivateManager(manager.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg flex justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Deactivate
                </button>
              ) : (
                <button
                  onClick={() => handleActivateManager(manager.id)}
                  className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg flex justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Activate
                </button>
              )}
              <button className="px-4 py-2 border rounded-lg">
                <Eye className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 border rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 ADD MANAGER MODAL */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Manager</h3>

            <form onSubmit={handleAddManager} className="space-y-4">
              <input
                name="userName"
                placeholder="Username"
                value={formData.userName}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? "Adding..." : "Add Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageManagers;

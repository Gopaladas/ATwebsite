import React, { useState } from "react";
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
import axios from "axios";
import { managerURI, userURI } from "../../../mainApi";

const MyTeam = ({
  team,
  searchTerm,
  setSearchTerm,
  handleDeactivateEmployee,
  fetchTeam,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    email: "",
    department: "",
    password: "",
    phoneNumber: "",
  });

  const filteredTeam = team.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeactivate = async (id) => {
    try {
      const res = await axios.patch(
        `${managerURI}/employees/${id}/deactivate`,
        {},
        { withCredentials: true }
      );
      // console.log(res);
      // handleDeactivateEmployee(id);
      fetchTeam();
      // alert("Employee deactivated successfully");
    } catch (error) {
      alert("Failed to deactivate employee");
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await axios.patch(
        `${managerURI}/employees/${id}/activate`,
        {},
        { withCredentials: true }
      );
      // console.log(res);
      fetchTeam();
      // handleDeactivateEmployee(id);
      // alert("Employee activated successfully");
    } catch (error) {
      alert("Failed to deactivate employee");
    }
  };

  // 🔹 HANDLE ADD EMPLOYEE SUBMIT
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${userURI}/register`, form, {
        withCredentials: true,
      });
      console.log(res);
      setShowModal(false);
      setForm({
        userName: "",
        email: "",
        department: "",
        password: "",
        phoneNumber: "",
      });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Team</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members..."
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

        {/* Employee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((employee) => (
            <div key={employee.id} className="bg-white border p-6 rounded-xl">
              <div className="flex gap-4 mb-4">
                {/* {console.log(employee)} */}
                <img
                  src={employee?.imageUrl}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm">{employee.position}</p>
                  <p className="text-xs text-gray-400">{employee.email}</p>
                  <p className="text-xs">{employee.department}</p>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <p className="text-sm">Joined: {employee.joinDate}</p>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.status}
                </span>
              </div>

              <div className="flex gap-2">
                {employee.status === "active" && (
                  <button
                    onClick={() => handleDeactivate(employee.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded"
                  >
                    <XCircle className="inline w-4 h-4" /> Deactivate
                  </button>
                )}
                {employee.status === "inactive" && (
                  <button
                    onClick={() => handleActivate(employee.id)}
                    className="flex-1 bg-red-50 text-green-600 py-2 rounded"
                  >
                    <CheckCircle className="inline w-4 h-4" /> Activate
                  </button>
                )}
                {/* <button className="border px-3 py-2 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="border px-3 py-2 rounded">
                  <Edit className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 ADD EMPLOYEE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Employee</h3>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Department"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="PhoneNumber"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTeam;

import { useEffect, useState } from "react";
import axios from "axios";
import { superAdminURI } from "../../../mainApi";

const StatusBadge = ({ active }) => (
  <span
    className={`px-3 py-1 text-xs rounded-full font-semibold ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const Table = ({ title, data, columns }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-8">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>

    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="p-3 text-left border">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-t hover:bg-gray-50">
              <td className="p-3">{item.userName}</td>
              <td className="p-3">{item.email}</td>
              <td className="p-3">{item.department || "-"}</td>
              <td className="p-3">
                <StatusBadge active={item.isActive} />
              </td>
              <td className="p-3">
                {item.lastLoginAt
                  ? new Date(item.lastLoginAt).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${superAdminURI}/stats`, {
        withCredentials: true,
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading detailed stats...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">System Dashboard</h2>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard label="Total HRs" value={stats.summary.totalHRs} />
        <SummaryCard
          label="Total Managers"
          value={stats.summary.totalManagers}
        />
        <SummaryCard
          label="Total Employees"
          value={stats.summary.totalEmployees}
        />
      </div>

      {/* DETAILS */}
      <Table
        title="HR Details"
        data={stats.data.hrs}
        columns={["Name", "Email", "Department", "Status", "Last Login"]}
      />

      <Table
        title="Manager Details"
        data={stats.data.managers}
        columns={["Name", "Email", "Department", "Status", "Last Login"]}
      />

      <Table
        title="Employee Details"
        data={stats.data.employees}
        columns={["Name", "Email", "Department", "Status", "Last Login"]}
      />
    </div>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow">
    <p className="text-sm opacity-80">{label}</p>
    <h3 className="text-3xl font-bold mt-2">{value}</h3>
  </div>
);

export default Dashboard;

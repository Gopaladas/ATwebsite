import React, { useEffect, useState } from "react";
import { employeeTaskURI } from "../mainApi";
import EmployeeTaskCard from "../pages/components/employee/EmployeeTaskCard";
import axios from "axios";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyTasks = async () => {
    try {
      const res = await axios.get(`${employeeTaskURI}/my-tasks`, {
        withCredentials: true,
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
        <span className="text-sm text-gray-500">Total: {tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <p className="text-gray-500">🎉 No tasks assigned yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <EmployeeTaskCard key={task._id} task={task} reload={loadMyTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;

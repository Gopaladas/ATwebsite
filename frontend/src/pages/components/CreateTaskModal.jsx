import React, { useEffect, useState } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../mainApi";

const CreateTaskModal = ({ close, reload, projectId, sprintId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      const res = await axios.get(`${managerURI}/employees`, {
        withCredentials: true,
      });
      setEmployees(res.data.data || []);
    };
    loadEmployees();
  }, []);

  const createTask = async () => {
    if (!title || !assignedTo || !projectId || !sprintId) {
      return alert("Missing required fields");
    }

    setLoading(true);
    try {
      await axios.post(
        `${managerTaskURI}/task`,
        {
          title,
          description,
          assignedTo,
          projectId,
          sprintId,
        },
        { withCredentials: true },
      );

      reload();
      close();
    } catch (err) {
      console.error(err);
      alert("Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={close} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 w-96 rounded">
          <h2 className="font-bold mb-4">Create Task</h2>

          <input
            className="w-full border p-2 mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 mb-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full border p-2 mb-4"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Assign employee</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.userName}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button onClick={close}>Cancel</button>
            <button
              onClick={createTask}
              className="bg-indigo-600 text-white px-3 py-1 rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTaskModal;

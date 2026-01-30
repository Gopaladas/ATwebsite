import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";

const CreateProjectModal = ({ close, reload }) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔹 Load Managers */
  useEffect(() => {
    const loadManagers = async () => {
      const res = await axios.get(`${hrURI}/getManagers`, {
        withCredentials: true,
      });
      setManagers(res.data.data || []);
    };
    loadManagers();
  }, []);

  const createProject = async () => {
    if (!name || !key || !managerId) {
      return alert("Name, Key & Manager are required");
    }

    setLoading(true);
    try {
      await axios.post(
        `${hrURI}/project`,
        { name, key, description, managerId },
        { withCredentials: true },
      );

      reload();
      close();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white w-96 p-6 rounded shadow-xl">
          <h2 className="font-bold text-lg mb-4">Create Project</h2>

          <input
            className="w-full border p-2 rounded mb-2"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded mb-2"
            placeholder="Project Key (CMS, HRM...)"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
          />

          <textarea
            className="w-full border p-2 rounded mb-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded mb-4"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">Assign Manager</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.userName} ({m.email})
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button onClick={close} className="border px-3 py-1 rounded">
              Cancel
            </button>

            <button
              onClick={createProject}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;

import React, { useState } from "react";
import axios from "axios";
import { managerTaskURI } from "../../../mainApi";

const CreateSprintModal = ({ close, projectId, onSprintCreated }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const createSprint = async () => {
    if (!name || !startDate || !endDate) {
      return alert("All fields are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${managerTaskURI}/projects/${projectId}/sprint`,
        { name, startDate, endDate },
        { withCredentials: true },
      );

      // 🔥 inform parent to reload sprints
      onSprintCreated(res.data.sprint);

      close();
    } catch (err) {
      console.error("Sprint creation failed", err);
      alert("Sprint creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={close} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white w-[400px] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Create Sprint</h3>

          <input
            className="w-full border rounded p-2 mb-3"
            placeholder="Sprint name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="text-xs text-gray-500">Start Date</label>
          <input
            type="date"
            className="w-full border rounded p-2 mb-3"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label className="text-xs text-gray-500">End Date</label>
          <input
            type="date"
            className="w-full border rounded p-2 mb-4"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={close}
              className="px-4 py-2 text-sm rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={createSprint}
              disabled={loading}
              className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Sprint"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSprintModal;

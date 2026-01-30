import React, { useState } from "react";
import axios from "axios";
import { CLOUD_NAME, employeeTaskURI, preset } from "../../../mainApi";

const SubmitWorkModal = ({ task, close, reload }) => {
  const [description, setDescription] = useState(task.description || "");
  const [progress, setProgress] = useState(task.progress || 0);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitWork = async () => {
    try {
      setLoading(true);

      const uploadedFiles = [];

      for (let file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", preset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          data,
        );

        uploadedFiles.push({
          url: res.data.secure_url,
          name: file.name,
          type: file.type,
        });
      }

      await axios.put(
        `${employeeTaskURI}/task/${task._id}/work`,
        {
          description,
          progress,
          attachments: uploadedFiles,
        },
        { withCredentials: true },
      );

      reload();
      close();
    } catch (err) {
      alert("Failed to submit work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white w-[420px] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-3">Submit Work</h3>

          <textarea
            className="w-full border rounded-lg p-3 text-sm"
            rows="4"
            placeholder="Describe what you worked on..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Progress */}
          <div className="mt-3">
            <label className="text-xs font-semibold">
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <input
            type="file"
            multiple
            className="mt-4 text-sm"
            onChange={(e) => setFiles([...e.target.files])}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={close}
              className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={submitWork}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitWorkModal;

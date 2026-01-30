import React, { useState } from "react";
import axios from "axios";
import SubmitWorkModal from "./SubmitWorkModal";
import ProgressBar from "./ProgressBar";
import { employeeTaskURI } from "../../../mainApi";

const statusColors = {
  TODO: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  DONE: "bg-green-100 text-green-700",
};

const EmployeeTaskCard = ({ task, reload }) => {
  const [showModal, setShowModal] = useState(false);

  const updateStatus = async (status) => {
    await axios.put(
      `${employeeTaskURI}/task/${task._id}/status`,
      { status },
      { withCredentials: true },
    );
    reload();
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800">{task.title}</h3>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}
        >
          {task.status.replace("_", " ")}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
        {task.description || "No description provided"}
      </p>

      {/* Project */}
      <p className="text-xs text-gray-400 mt-3">
        Project:{" "}
        <span className="font-medium text-gray-600">
          {task.projectId?.name}
        </span>
      </p>

      {/* Progress */}
      <div className="mt-3">
        <p className="text-xs text-gray-500">
          Progress: <span className="font-semibold">{task.progress}%</span>
        </p>
        <ProgressBar value={task.progress} />
        <p className="text-xs text-gray-400 mt-1">
          Stage: {task.status.replace("_", " ")}
        </p>
      </div>

      {/* Status Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map(
          (status) =>
            task.status !== status && (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
              >
                {status.replace("_", " ")}
              </button>
            ),
        )}
      </div>

      {/* Attachments */}
      {task.attachments?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1">Attachments</p>
          <ul className="space-y-1">
            {task.attachments.map((file, i) => (
              <li key={i}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline"
                >
                  📎 {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Work */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-5 w-full text-sm py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
      >
        Submit / Update Work
      </button>

      {showModal && (
        <SubmitWorkModal
          task={task}
          close={() => setShowModal(false)}
          reload={reload}
        />
      )}
    </div>
  );
};

export default EmployeeTaskCard;

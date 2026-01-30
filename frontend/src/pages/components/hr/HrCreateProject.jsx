import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";
import CreateProjectModal from "./HrCreateModal";

const HrCreateProject = () => {
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [showModal, setShowModal] = useState(false);

  const loadProjects = async () => {
    const res = await axios.get(`${hrURI}/projects`, {
      withCredentials: true,
    });

    const list = res.data.projects || [];
    setProjects(list);

    // 🔹 Load progress for each project
    list.forEach((p) => loadProgress(p._id));
  };

  const loadProgress = async (projectId) => {
    try {
      const res = await axios.get(`${hrURI}/projects/${projectId}/progress`, {
        withCredentials: true,
      });

      setProgressMap((prev) => ({
        ...prev,
        [projectId]: res.data.data.percentage,
      }));
    } catch (err) {
      console.error("Progress fetch error", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold">HR – Projects</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Create Project
        </button>
      </div>

      {/* 🔹 PROJECT LIST */}
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => {
          const progress = progressMap[project._id] ?? 0;

          return (
            <div key={project._id} className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold text-lg">{project.name}</h2>
              <p className="text-sm text-gray-600">
                {project.description || "No description"}
              </p>

              <div className="mt-2 text-sm">
                <span className="font-medium">Key:</span> {project.key}
              </div>

              <div className="text-sm">
                <span className="font-medium">Manager:</span>{" "}
                {project.managerId?.userName}
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                {/* 🔹 PROGRESS BAR */}
                <div className="w-full bg-gray-200 rounded h-2">
                  <div
                    className={`h-2 rounded ${
                      progress === 100 ? "bg-green-600" : "bg-indigo-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Status: {project.status}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateProjectModal
          close={() => setShowModal(false)}
          reload={loadProjects}
        />
      )}
    </div>
  );
};

export default HrCreateProject;

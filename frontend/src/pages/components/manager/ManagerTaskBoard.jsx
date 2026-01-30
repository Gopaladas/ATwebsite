import React, { useEffect, useState } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../../mainApi";
import ProjectTaskBoard from "./ProjectTaskBoard";
import ProgressBar from "./ProgressBar";

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  const loadProjects = async () => {
    const res = await axios.get(`${managerURI}/projects`, {
      withCredentials: true,
    });

    setProjects(res.data.data || []);

    // load progress per project
    res.data.data.forEach(async (p) => {
      const pr = await axios.get(
        `${managerTaskURI}/project/${p._id}/progress`,
        { withCredentials: true },
      );

      setProgressMap((prev) => ({
        ...prev,
        [p._id]: pr.data.data.percentage,
      }));
    });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (selectedProject) {
    return (
      <ProjectTaskBoard
        project={selectedProject}
        back={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Projects</h2>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="border rounded p-4 bg-white shadow">
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.description}</p>

            <ProgressBar value={progressMap[project._id] || 0} />

            <button
              onClick={() => setSelectedProject(project)}
              className="mt-3 text-indigo-600 font-medium"
            >
              View Board →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerProjects;

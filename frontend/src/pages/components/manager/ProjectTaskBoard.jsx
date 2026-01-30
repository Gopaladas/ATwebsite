import React, { useEffect, useState } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../../mainApi";

import TaskColumn from "../TaskColumn";
import CreateTaskModal from "../CreateTaskModal";
import CreateSprintModal from "./CreateSprintModal";
import ProgressBar from "./ProgressBar";

const ProjectTaskBoard = ({ project, back }) => {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprintId, setActiveSprintId] = useState("");
  const [sprintProgress, setSprintProgress] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);

  const loadSprints = async () => {
    const res = await axios.get(
      `${managerURI}/projects/${project._id}/sprints`,
      { withCredentials: true },
    );

    const sprintList = res.data.data || [];
    setSprints(sprintList);

    if (!activeSprintId && sprintList.length) {
      setActiveSprintId(sprintList[0]._id);
    }
  };

  const loadSprintProgress = async () => {
    if (!activeSprintId) return;

    const res = await axios.get(
      `${managerTaskURI}/sprint/${activeSprintId}/progress`,
      { withCredentials: true },
    );

    setSprintProgress(res.data.data.percentage || 0);
  };

  const loadTasks = async () => {
    if (!activeSprintId) return;

    const res = await axios.get(`${managerTaskURI}/sprint/${activeSprintId}`, {
      withCredentials: true,
    });

    setTasks(res.data.data || []);
    loadSprintProgress();
  };

  useEffect(() => {
    loadSprints();
  }, [project]);

  useEffect(() => {
    loadTasks();
  }, [activeSprintId]);

  const todo = tasks.filter((t) => t.status === "TODO");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div>
      <button onClick={back} className="text-sm text-gray-500 mb-2">
        ← Back
      </button>

      <h2 className="text-xl font-bold mb-4">{project.name}</h2>

      {/* Sprint Progress */}
      <div className="my-4">
        <h4 className="text-sm font-semibold mb-1">Sprint Progress</h4>
        <ProgressBar value={sprintProgress} />
      </div>

      {/* Sprint selector */}
      <select
        className="border p-2 mb-4"
        value={activeSprintId}
        onChange={(e) => setActiveSprintId(e.target.value)}
      >
        {sprints.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowSprintModal(true)}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          + Sprint
        </button>

        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-indigo-600 text-white px-3 py-1 rounded"
        >
          + Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TaskColumn statusKey="TODO" tasks={todo} reload={loadTasks} />
        <TaskColumn
          statusKey="IN_PROGRESS"
          tasks={inProgress}
          reload={loadTasks}
        />
        <TaskColumn statusKey="DONE" tasks={done} reload={loadTasks} />
      </div>

      {showTaskModal && (
        <CreateTaskModal
          close={() => setShowTaskModal(false)}
          reload={loadTasks}
          projectId={project._id}
          sprintId={activeSprintId}
        />
      )}

      {showSprintModal && (
        <CreateSprintModal
          close={() => setShowSprintModal(false)}
          projectId={project._id}
          onSprintCreated={loadSprints}
        />
      )}
    </div>
  );
};

export default ProjectTaskBoard;

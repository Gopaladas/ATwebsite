import TaskCard from "./TaskCard";

const LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const TaskColumn = ({ statusKey, tasks, reload }) => {
  return (
    <div className="bg-gray-50 rounded p-3">
      <h3 className="font-bold text-center mb-3">{LABELS[statusKey]}</h3>

      <div className="flex flex-col gap-3">
        {tasks.length ? (
          tasks.map((t) => <TaskCard key={t._id} task={t} reload={reload} />)
        ) : (
          <p className="text-xs text-gray-400 text-center">No tasks</p>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;

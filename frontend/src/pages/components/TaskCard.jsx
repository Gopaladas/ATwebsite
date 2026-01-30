import axios from "axios";
import { managerTaskURI } from "../../mainApi";

const TaskCard = ({ task, reload }) => {
  const updateStatus = async (status) => {
    await axios.patch(
      `${managerTaskURI}/task/${task._id}/status`,
      { status },
      { withCredentials: true },
    );
    reload();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">{task.title}</h4>
      <p className="text-sm text-gray-600">{task.description}</p>

      <div className="flex gap-2 mt-3">
        {["TODO", "IN_PROGRESS", "DONE"].map(
          (s) =>
            s !== task.status && (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="text-xs px-2 py-1 border rounded"
              >
                {s.replace("_", " ")}
              </button>
            ),
        )}
      </div>
    </div>
  );
};

export default TaskCard;

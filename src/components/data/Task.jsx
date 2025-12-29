import TaskIcon from "../../assets/icons/tasks.tsx";
import DisplayModal from "../modals/DisplayModal.jsx";
import { useState } from "react";

function Task({ title, date, assignedTo, status, type, wholeTask }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleTaskClick = (taskInfo) => {
        setSelectedTask(taskInfo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <div
            onClick={() => handleTaskClick(wholeTask)}
            className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 cursor-pointer ease-in-out text-[var(--black)]"
        >
            {type === "table" ? (
                <>
                    <div className="flex flex-row items-center gap-1 mb-1 w-full">
                        <TaskIcon className="w-4 flex-shrink-0" />
                        <h1 className="text-sm font-semibold truncate">
                            {title || "N/A"}
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--gray)]">
                        {assignedTo || "Nessuno"} • {date || "N/A"} •{" "}
                        {status || "N/A"}
                    </p>
                </>
            ) : (
                <>
                    <div className="flex flex-row items-center gap-1 mb-1 w-full">
                        <TaskIcon className="w-4 flex-shrink-0" />
                        <h1 className="text-l font-semibold truncate">
                            {title || "N/A"}
                        </h1>
                    </div>
                    <p className="text-sm text-[var(--gray)]">
                        {assignedTo || "N/A"} • {date || "N/A"} •{" "}
                        {status || "N/A"}
                    </p>
                </>
            )}

            {isModalOpen && (
                <DisplayModal
                    taskInfo={selectedTask}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default Task;

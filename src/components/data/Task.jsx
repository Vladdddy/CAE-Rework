import TaskIcon from "../../assets/icons/tasks.tsx";
import DisplayModal from "../modals/DisplayModal.jsx";
import Splitter from "../../functions/SplitAssignedTo.jsx";
import { useState } from "react";

function Task({ title, date, status, type, wholeTask, onDeleteSuccess }) {
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
                    <div className="flex flex-row items-center gap-1 mb-2 w-full">
                        <TaskIcon className="w-4 flex-shrink-0" />
                        <h1 className="text-sm font-semibold truncate">
                            {title || "N/A"}
                        </h1>
                    </div>

                    <div className="flex flex-col justify-between gap-2 w-full">
                        <div className="flex items-center gap-1 flex-wrap truncate flex-1">
                            <Splitter
                                taskInfo={wholeTask}
                                style="text-xs text-[var(--gray)]"
                            />
                        </div>

                        <div className="flex flex-row items-center gap-1 flex-1 flex-wrap">
                            <p className="text-xs text-[var(--gray)]">
                                {date || "N/A"}
                            </p>
                            <p className="text-xs text-[var(--gray)]">•</p>
                            <p className="text-xs text-[var(--gray)]">
                                {status || "N/A"}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-row items-center gap-1 mb-2 w-full">
                        <TaskIcon className="w-4 flex-shrink-0" />
                        <h1 className="text-l font-semibold truncate">
                            {title || "N/A"}
                        </h1>
                    </div>

                    <div className="flex flex-row justify-between gap-1 w-full">
                        <div className="flex items-center gap-1 max-w-xs flex-wrap truncate flex-1">
                            <Splitter
                                taskInfo={wholeTask}
                                style="text-xs text-[var(--gray)]"
                            />
                        </div>

                        <div className="flex flex-row items-center gap-1 flex-1 justify-end flex-wrap">
                            <p className="text-xs text-[var(--gray)]">
                                {date || "N/A"}
                            </p>
                            <p className="text-xs text-[var(--gray)]">•</p>
                            <p className="text-xs text-[var(--gray)]">
                                {status || "N/A"}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {isModalOpen && (
                <DisplayModal
                    taskInfo={selectedTask}
                    onClose={handleCloseModal}
                    onSuccess={onDeleteSuccess}
                />
            )}
        </div>
    );
}

export default Task;

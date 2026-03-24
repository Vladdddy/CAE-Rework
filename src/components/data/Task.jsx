import TaskIcon from "../../assets/icons/tasks.tsx";
import EntryIcon from "../../assets/icons/logbook.tsx";
import DisplayModal from "../modals/DisplayModal.jsx";
import Splitter from "../../functions/SplitAssignedTo.jsx";
import React, { useState } from "react";

function Task({
    title,
    date,
    status,
    type,
    wholeTask,
    onDeleteSuccess,
    isLogbook,
    isFlagged,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const isUnavailableTask =
        wholeTask?.IS_UNAVAILABLE || wholeTask?.TYPE === "Unavailable";

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
            className={`${type === "dashboard&today" ? "hover:text-[var(--weekend-text)]" : null} ${isFlagged ? "border-[var(--red)] hover:border-[var(--red)]" : null} ${type === "dashboard&logbook" ? "hover:text-[var(--orange)]" : "hover:text-[var(--primary)]"} hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] transition-all duration-200 cursor-pointer ease-in-out text-[var(--black)]`}
        >
            {type === "table" ? (
                <>
                    <div
                        className={`flex flex-row items-center gap-1 mb-2 w-full ${isUnavailableTask ? "opacity-50" : ""}`}
                    >
                        {!isLogbook === true ? (
                            <TaskIcon className="w-4 flex-shrink-0 text-[var(--primary)]" />
                        ) : (
                            <EntryIcon className="w-4 flex-shrink-0 text-[var(--orange)]" />
                        )}
                        <h1
                            className={`text-sm font-semibold truncate ${!isLogbook ? "text-[var(--primary)]" : "text-[var(--orange)]"}`}
                        >
                            {title || "N/A"}
                        </h1>
                    </div>

                    <div
                        className={`flex flex-col justify-between gap-2 w-full ${isUnavailableTask ? "opacity-50" : ""}`}
                    >
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
                            <p
                                className={`text-xs ${status === "Completato" || status === "Completato da SL" ? "text-[var(--green)] font-bold" : "text-[var(--gray)]"} ${status === "Non completato" ? "text-[var(--red)] font-bold" : "text-[var(--gray)]"} ${status === "In corso" ? "text-[var(--ambra)] font-bold" : "text-[var(--gray)]"}`}
                            >
                                {status || "N/A"}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-row items-center gap-1 mb-2 w-full">
                        {type !== "dashboard&logbook" ? (
                            <TaskIcon className="w-4 flex-shrink-0" />
                        ) : (
                            <EntryIcon className="w-4 flex-shrink-0" />
                        )}

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
                            <p
                                className={`text-xs ${status === "Completato" || status === "Completato da SL" ? "text-[var(--green)] font-bold" : "text-[var(--gray)]"} ${status === "Non completato" ? "text-[var(--red)] font-bold" : "text-[var(--gray)]"} ${status === "In corso" ? "text-[var(--ambra)] font-bold" : "text-[var(--gray)]"}`}
                            >
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

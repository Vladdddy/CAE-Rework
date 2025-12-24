import React from "react";
import DayIcon from "../assets/icons/day.tsx";
import NightIcon from "../assets/icons/night.tsx";
import Task from "./Task.jsx";
import Logbook from "./Logbook.jsx";

import DisplayModal from "../components/modals/DisplayModal.jsx";
import { useState } from "react";

function Table({ type }) {
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
        <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <DayIcon className="w-6" />
                        <h1 className="text-md">Giorno</h1>
                        {type === "tasks" ? (
                            <>
                                <span className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                    9 task
                                </span>
                                <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                    4 logbook
                                </span>
                            </>
                        ) : (
                            <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                4 logbook
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-4 justify-start items-start gap-1 max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        <div className="flex flex-col gap-2">
                            <div className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                <p>FTD</p>
                            </div>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 1")}
                            />
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                            <Logbook
                                logbookInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                109FFS
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                139#1
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                139#3
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                169
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                189
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                Others
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <NightIcon className="w-6" />
                        <h1 className="text-md">Notte</h1>
                    </div>

                    <div className="grid grid-cols-7 gap-4 justify-start items-start gap-1 max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                FTD
                            </p>
                            <span className="text-center text-[var(--gray)] text-xs mt-4">
                                Nessuna task o entry
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                109FFS
                            </p>
                            <span className="text-center text-[var(--gray)] text-xs mt-4">
                                Nessuna task o entry
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                139#1
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 3")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                139#3
                            </p>
                            <Task
                                taskInfo={""}
                                onClick={() => handleTaskClick("Task 2")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                169
                            </p>
                            <span className="text-center text-[var(--gray)] text-xs mt-4">
                                Nessuna task o entry
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                189
                            </p>
                            <span className="text-center text-[var(--gray)] text-xs mt-4">
                                Nessuna task o entry
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2">
                                Others
                            </p>
                            <span className="text-center text-[var(--gray)] text-xs mt-4">
                                Nessuna task o entry
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <DisplayModal
                    taskInfo={selectedTask}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default Table;

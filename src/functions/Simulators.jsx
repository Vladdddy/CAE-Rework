import ClockIcon from "../assets/icons/shifts.tsx";
import { useState } from "react";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";
import Task from "../components/data/Task.jsx";

export default function GetSimulators({ type, bond, taskList }) {
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

    const handleSimulatorClick = () => {
        setIsSimulatorModalOpen(true);
    };

    const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const simulators = [
        "FTD",
        "109FFS",
        "139#1",
        "139#3",
        "169",
        "189",
        "Others",
    ];

    return (
        <>
            <div
                className={`${
                    type === "table"
                        ? "grid grid-cols-7 gap-4 justify-start items-start gap-1"
                        : ""
                } `}
            >
                {simulators.map((simulator, index) => (
                    <div key={index} className={"flex flex-col gap-2"}>
                        {type === "table" ? (
                            <div className="flex items-center gap-1">
                                {index === 3 ? (
                                    <div
                                        onClick={() =>
                                            handleSimulatorClick(true)
                                        }
                                        className="bg-[var(--primary)] rounded-md p-1 flex items-center justify-center cursor-pointer hover:bg-[var(--primary-hover)] transition-all duration-200"
                                    >
                                        <ClockIcon className="w-4 text-[#ffffff]" />
                                    </div>
                                ) : null}
                                <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2 flex-1">
                                    {simulator}
                                </p>
                            </div>
                        ) : null}
                        {!taskList || taskList.length === 0 ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Nessuna task trovata
                            </div>
                        ) : (
                            taskList
                                .filter((task) => {
                                    const matchesTime = task?.TIME === bond;
                                    const matchesSimulator =
                                        task?.SIMULATOR === simulator;
                                    return matchesTime && matchesSimulator;
                                })
                                .map((task) => (
                                    <div
                                        className="flex flex-col gap-2"
                                        key={task.id}
                                    >
                                        {type === "dashboard" && (
                                            <p className="mt-4 text-sm text-[var(--primary)]">
                                                {simulator}
                                            </p>
                                        )}

                                        <Task
                                            key={task.id}
                                            title={task?.TITLE}
                                            date={formatDate(task?.DATE)}
                                            assignedTo={task?.ASSIGNED_TO}
                                            status={task?.STATUS}
                                            type="table"
                                            wholeTask={task}
                                        />
                                    </div>
                                ))
                        )}
                    </div>
                ))}

                {isSimulatorModalOpen && (
                    <SimulatorModal
                        onClose={handleCloseSimulatorModal}
                        simulatorInfo={simulators[3]}
                        startTime={"08:00"}
                        endTime={"10:00"}
                        assignee={"Marco"}
                    />
                )}
            </div>
        </>
    );
}

export function GetSimulatorsList() {
    return ["FTD", "109FFS", "139#1", "139#3", "169", "189", "Others"];
}

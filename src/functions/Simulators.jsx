import ClockIcon from "../assets/icons/shifts.tsx";
import { useState } from "react";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";

export default function GetSimulators({ type }) {
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

    const handleSimulatorClick = () => {
        setIsSimulatorModalOpen(true);
    };

    const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
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
                        : "flex flex-col gap-2"
                } `}
            >
                {simulators.map((simulator, index) => (
                    <div
                        key={index}
                        className={`${
                            type === "table" ? "flex flex-col gap-2" : ""
                        } `}
                    >
                        {type === "dashboard" ? (
                            <p className="mt-4 text-sm text-[var(--primary)]">
                                {simulator}
                            </p>
                        ) : type === "table" ? (
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
                        <p className="text-[var(--black)]">{index} task</p>
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

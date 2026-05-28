import { useState } from "react";
import SimulatorIcon from "../../assets/icons/simulator.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import { useSimulators } from "../data/provider/simulatorAPI/useSimulators.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";

function toTimeInputValue(dbTime) {
    if (!dbTime) return "";
    let timePart = dbTime;
    if (timePart.includes("T")) timePart = timePart.split("T")[1];
    if (timePart.includes(" ")) timePart = timePart.split(" ")[1];
    timePart = timePart.split(".")[0];
    if (timePart.split(":").length > 2)
        timePart = timePart.split(":").slice(0, 2).join(":");
    if (timePart.length > 5) timePart = timePart.slice(0, 5);
    return timePart;
}

function SimulatorModal({
    onClose,
    simulatorInfo,
    startTime,
    endTime,
    assignee,
    creationDate,
    time,
    morningReadinessAssignee,
}) {
    const [name, setName] = useState(simulatorInfo || "FTD");
    const [startHour, setStartHour] = useState(toTimeInputValue(startTime));
    const [endHour, setEndHour] = useState(toTimeInputValue(endTime));
    const [assignedTo, setAssignedTo] = useState(() => {
        if (assignee) return assignee.split(",").map((a) => a.trim());
        if (morningReadinessAssignee) {
            return morningReadinessAssignee
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean);
        }
        return [];
    });
    const simulators = GetSimulatorsList();
    const { createSimulator, updateSimulator } = useSimulators();
    const { users } = useUsers();
    const [emptyError, setEmptyError] = useState(false);
    const [editSimulator, setEditSimulator] = useState(false);
    const [existingSimulatorError, setExistingSimulatorError] = useState(false);

    const handleCheckboxChange = (username) => {
        setAssignedTo((prev) =>
            prev.includes(username)
                ? prev.filter((item) => item !== username)
                : [...prev, username],
        );
    };

    const handleSave = async () => {
        if (!name) {
            setEmptyError(true);
            return;
        }
        setEmptyError(false);

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const localDate = `${year}-${month}-${day}`;

        const newSimulator = {
            name: name,
            startHour: startHour || null,
            endHour: endHour || null,
            assignedTo: assignedTo.join(", "),
            creationDate: localDate,
        };

        console.log("New Simulator Data:", newSimulator);

        const result = await createSimulator(newSimulator);
        if (result.success) {
            console.log("Simulator created successfully:", result.data);
            onClose();
        } else {
            console.error("Error creating simulator:", result.error);
            if (result.status === 409) {
                setExistingSimulatorError(true);
            }
        }
    };

    const handleEdit = async () => {
        const finalName = name || simulatorInfo;
        const finalStartHour = startHour || null;
        const finalEndHour = endHour || null;
        const finalAssignedTo = assignedTo.join(", ");

        console.log("Editing Simulator with data:", {
            name: finalName,
            startHour: finalStartHour,
            endHour: finalEndHour,
            assignedTo: finalAssignedTo,
        });

        if (!finalName) {
            setEmptyError(true);
            return;
        }
        setEmptyError(false);

        const updatedSimulator = {
            name: finalName,
            startHour: finalStartHour,
            endHour: finalEndHour,
            assignedTo: finalAssignedTo,
            creationDate: creationDate,
        };

        console.log("Updated Simulator Data:", updatedSimulator);

        const result = await updateSimulator(updatedSimulator);
        if (result.success) {
            console.log("Simulator updated successfully:", result.data);
        } else {
            console.error("Error updating simulator:", result.error);
            if (result.status === 409) {
                setExistingSimulatorError(true);
                return;
            }
        }

        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <SimulatorIcon className="w-6" />
                        {simulatorInfo ? (
                            <h1 className="text-xl">Orari {simulatorInfo}</h1>
                        ) : (
                            <h1 className="text-xl">Orari simulatore</h1>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8 max-h-[calc(80vh-1rem)] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Simulatore
                        </h3>
                        <div className="relative">
                            <select
                                name=""
                                id=""
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setEditSimulator(true);
                                    setExistingSimulatorError(false);
                                }}
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                {simulatorInfo ? (
                                    <option value={simulatorInfo}>
                                        {simulatorInfo}
                                    </option>
                                ) : (
                                    <>
                                        {simulators.map((simulator, index) => (
                                            <option
                                                key={index}
                                                value={simulator}
                                            >
                                                {simulator}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                {time === "Diurno"
                                    ? "Orario inizio"
                                    : "Orario fine"}
                            </h3>
                            <input
                                type="time"
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={startHour}
                                onChange={(e) => {
                                    setStartHour(e.target.value);
                                    setEditSimulator(true);
                                    setExistingSimulatorError(false);
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                {time === "Diurno"
                                    ? "Orario fine"
                                    : "Orario inizio"}
                            </h3>
                            <input
                                type="time"
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={endHour}
                                onChange={(e) => {
                                    setEndHour(e.target.value);
                                    setEditSimulator(true);
                                    setExistingSimulatorError(false);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Assegnatario/i
                        </h3>
                        <div className="grid grid-cols-3 gap-2 rounded-md p-2 border border-[var(--light-primary)]">
                            {users.map((user) => {
                                return (
                                    <div
                                        key={user.Username}
                                        onClick={() => {
                                            handleCheckboxChange(user.Username);
                                            setEditSimulator(true);
                                            if (emptyError) {
                                                setEmptyError(false);
                                            }
                                        }}
                                        className={`flex items-center gap-2 rounded-md p-2 flex-1 border border-transparent cursor-pointer hover:bg-[var(--light-primary)] ${
                                            assignedTo.includes(user.Username)
                                                ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                                : "text-[var(--black)]"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name=""
                                            id={user.Username}
                                            checked={assignedTo.includes(
                                                user.Username,
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(
                                                    user.Username,
                                                )
                                            }
                                            className="hidden"
                                        />
                                        <UserIcon className="w-6 shrink-0" />
                                        <label
                                            className="truncate cursor-pointer"
                                            htmlFor={user.Username}
                                        >
                                            {user.Username.split(".")[0]
                                                .charAt(0)
                                                .toUpperCase() +
                                                user.Username.split(
                                                    ".",
                                                )[0].slice(1)}
                                            {user.Username.split(".")[1] && (
                                                <>
                                                    {" "}
                                                    {user.Username.split(".")[1]
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        user.Username.split(
                                                            ".",
                                                        )[1].slice(1)}
                                                </>
                                            )}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        {existingSimulatorError && (
                            <p className="text-[var(--red)] text-sm mt-1">
                                Questo simulatore è già stato impostato per
                                oggi.
                            </p>
                        )}
                    </div>

                    {emptyError && (
                        <p className="text-[var(--red)] text-sm -mt-4">
                            Compila il nome del simulatore.
                        </p>
                    )}

                    <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                        <button className="btn gray-btn" onClick={onClose}>
                            Chiudi
                        </button>

                        {simulatorInfo ? (
                            <button
                                className={
                                    editSimulator === true
                                        ? "btn"
                                        : "btn opacity-50 cursor-not-allowed"
                                }
                                disabled={!editSimulator}
                                onClick={
                                    editSimulator === true
                                        ? handleEdit
                                        : onClose
                                }
                            >
                                <p>Salva</p>
                            </button>
                        ) : (
                            <button className="btn" onClick={handleSave}>
                                <p>Salva</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimulatorModal;

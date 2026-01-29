import { useState } from "react";
import SimulatorIcon from "../../assets/icons/simulator.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import { useSimulators } from "../data/provider/simulatorAPI/useSimulators.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";

function SimulatorModal({
    onClose,
    simulatorInfo,
    startTime,
    endTime,
    assignee,
}) {
    const [name, setName] = useState("FTD");
    const [startHour, setStartHour] = useState("");
    const [endHour, setEndHour] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const simulators = GetSimulatorsList();
    const { createSimulator } = useSimulators();
    const { users } = useUsers();
    const [emptyError, setEmptyError] = useState(false);
    const [editSimulator, setEditSimulator] = useState(false);
    const [existingSimulatorError, setExistingSimulatorError] = useState(false);

    const handleSave = async () => {
        if (!name || !startHour || !endHour || !assignedTo) {
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
            startHour: startHour,
            endHour: endHour,
            assignedTo: assignedTo,
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
        console.log("EDIT");

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
                                Orario inizio
                            </h3>
                            <input
                                type="time"
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={startHour || startTime}
                                required
                                onChange={(e) => {
                                    setStartHour(e.target.value);
                                    setEditSimulator(true);
                                    setExistingSimulatorError(false);
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Orario fine
                            </h3>
                            <input
                                type="time"
                                required
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={endHour || endTime}
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
                            Assegnatario
                        </h3>
                        <div className="relative">
                            <select
                                name="assignedTo"
                                id="assignedTo"
                                value={assignedTo || assignee}
                                onChange={(e) => {
                                    setAssignedTo(e.target.value);
                                    setEditSimulator(true);
                                }}
                                required
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                <option value="">...</option>
                                {users.map((user, index) => (
                                    <option key={index} value={user.Username}>
                                        {user.Username.split(".")[0]
                                            .charAt(0)
                                            .toUpperCase() +
                                            user.Username.split(".")[0].slice(
                                                1,
                                            )}
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
                                    </option>
                                ))}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                        {emptyError && (
                            <p className="text-[var(--red)] text-sm mt-1">
                                Per favore, compila tutti i campi.
                            </p>
                        )}
                        {existingSimulatorError && (
                            <p className="text-[var(--red)] text-sm mt-1">
                                Questo simulatore è già stato impostato per
                                oggi.
                            </p>
                        )}
                    </div>

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

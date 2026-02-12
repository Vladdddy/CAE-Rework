import { useState } from "react";
import PatternIcon from "../../assets/icons/pattern.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI/useEmployeeShifts.js";

function ShiftsPattern({ onClose }) {
    const [activeTab, setActiveTab] = useState("Seleziona");
    const { users } = useUsers();
    const { addEmployeeShift, updateEmployeeShift, employeeShifts } =
        useEmployeeShifts();
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [selectedPattern, setSelectedPattern] = useState(null);
    const [selectedFrom, setSelectedFrom] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [selectedTo, setSelectedTo] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [dateError, setDateError] = useState(false);
    const [selectedRadio, setSelectedRadio] = useState(false);
    const [duration, setDuration] = useState("");
    const [saving, setSaving] = useState(false);

    const defaultPatterns = {
        "Shift Leader": ["ON", "OP", "O", "ON", "OP"],
        DRNR: ["D", "R", "N", "R"],
        NRDR: ["N", "R", "D", "R"],
        Ferie: ["F"],
        Malattia: ["M"],
    };

    const handleCheckboxChange = (name) => {
        setSelectedAssignees((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name],
        );
    };

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    };

    const applyPattern = async () => {
        // Validation
        if (!selectedPattern) {
            return;
        }

        const pattern = defaultPatterns[selectedPattern];

        // Duration is only required for patterns with more than 1 shift
        let durationNum = 1;
        if (pattern.length > 1) {
            if (!duration || parseInt(duration) < 1 || parseInt(duration) > 7) {
                return;
            }
            durationNum = parseInt(duration);
        }

        if (!selectedFrom || !selectedTo) {
            return;
        }

        const fromDate = new Date(selectedFrom);
        const toDate = new Date(selectedTo);

        if (fromDate > toDate) {
            setDateError(true);
            return;
        }
        setDateError(false);

        if (selectedAssignees.length === 0) {
            return;
        }

        setSaving(true);

        try {
            const includeWeekends = selectedRadio === true;

            // Collect all shift operations to perform in batch
            const shiftOperations = [];

            // For each selected user
            for (const username of selectedAssignees) {
                const user = users.find((u) => u.Username === username);
                if (!user) continue;

                // Generate shifts for the date range
                const currentDate = new Date(fromDate);
                let patternIndex = 0;
                let daysInCurrentShift = 0;

                while (currentDate <= toDate) {
                    const dayOfWeek = currentDate.getDay();
                    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

                    // Skip weekends if "Ignora i weekend" is selected
                    if (!includeWeekends && isWeekendDay) {
                        currentDate.setDate(currentDate.getDate() + 1);
                        continue;
                    }

                    // Get current shift type from pattern
                    const shiftType = pattern[patternIndex];

                    // Create shift for this day
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(
                        2,
                        "0",
                    );
                    const day = String(currentDate.getDate()).padStart(2, "0");
                    const formattedDate = `${year}-${month}-${day}`;

                    // Check if shift already exists for this employee and date
                    const existingShift = employeeShifts.find(
                        (shift) =>
                            shift.EMPLOYEE_ID === user.ID &&
                            shift.SELECTED_DATE &&
                            shift.SELECTED_DATE.split("T")[0] === formattedDate,
                    );

                    // Add operation to batch
                    if (existingShift) {
                        shiftOperations.push({
                            type: "update",
                            id: existingShift.id,
                            data: {
                                EMPLOYEE_ID: user.ID,
                                SELECTED_DATE: formattedDate,
                                SHIFT_TYPE: shiftType,
                            },
                        });
                    } else {
                        shiftOperations.push({
                            type: "add",
                            data: {
                                EMPLOYEE_ID: user.ID,
                                SELECTED_DATE: formattedDate,
                                SHIFT_TYPE: shiftType,
                            },
                        });
                    }

                    daysInCurrentShift++;

                    // Check if we completed the duration for this shift
                    // OR if we're ignoring weekends, today is Friday, and we haven't completed the full duration
                    const shouldMoveToNextShift =
                        daysInCurrentShift >= durationNum ||
                        (!includeWeekends &&
                            dayOfWeek === 5 &&
                            daysInCurrentShift > 0 &&
                            daysInCurrentShift < durationNum);

                    if (shouldMoveToNextShift) {
                        // Move to next shift in pattern
                        patternIndex = (patternIndex + 1) % pattern.length;
                        daysInCurrentShift = 0;
                    }

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            // Execute all operations in parallel
            await Promise.all(
                shiftOperations.map((operation) => {
                    if (operation.type === "update") {
                        return updateEmployeeShift(
                            operation.id,
                            operation.data,
                        );
                    } else {
                        return addEmployeeShift(operation.data);
                    }
                }),
            );

            onClose();
        } catch (error) {
            console.error("Errore durante l'applicazione del pattern:", error);
            alert("Errore durante l'applicazione del pattern");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm cursor-default flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <PatternIcon className="w-6" />
                        <h1 className="text-xl">Pattern shift</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {/* <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                        <div
                            className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTab === "Seleziona"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => setActiveTab("Seleziona")}
                        >
                            <p className="text-sm">Seleziona pattern</p>
                        </div>

                        <div
                            className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTab === "Crea"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => {
                                setActiveTab("Crea");
                            }}
                        >
                            <p className="text-sm">Aggiungi pattern</p>
                        </div>
                    </div> */}

                    <div className="flex flex-col gap-8 max-h-[calc(60vh-1rem)] overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Pattern disponibili
                            </h3>
                            <div className="flex flex-col flex-1 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                {Object.entries(defaultPatterns).map(
                                    ([name, pattern]) => (
                                        <div
                                            key={name}
                                            onClick={() =>
                                                setSelectedPattern(name)
                                            }
                                            className={`flex items-center justify-between cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                                selectedPattern === name
                                                    ? "bg-[var(--light-primary)] transition-all duration-300"
                                                    : ""
                                            }`}
                                        >
                                            <label
                                                className={`cursor-pointer truncate transition-all duration-300 ${
                                                    selectedPattern === name
                                                        ? "text-[var(--primary)]"
                                                        : "text-[var(--black)]"
                                                }`}
                                                htmlFor={name}
                                            >
                                                {name}
                                            </label>
                                            <label
                                                className={`cursor-pointer text-xs truncate transition-all duration-300 ${
                                                    selectedPattern === name
                                                        ? "text-[var(--black)]"
                                                        : "text-[var(--gray)]"
                                                }`}
                                                htmlFor={name}
                                            >
                                                {pattern.join(", ")}
                                            </label>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {selectedPattern &&
                            defaultPatterns[selectedPattern].length > 1 && (
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Durata turno
                                    </h3>
                                    <input
                                        type="number"
                                        min="1"
                                        max="7"
                                        value={duration}
                                        onChange={(e) => {
                                            setDuration(e.target.value);
                                        }}
                                        className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 border border-[var(--light-primary)] focus:border-[var(--separator)]`}
                                        placeholder="Inserisci il numero di cicli a settimana per turno (max. 7)"
                                        required
                                    />
                                </div>
                            )}

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Comportamento pattern
                            </h3>
                            <div className="flex flex-row items-center gap-1 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                <div
                                    onClick={() => setSelectedRadio(true)}
                                    className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        selectedRadio === true
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="turno"
                                        id="include"
                                        value={selectedRadio}
                                        checked={selectedRadio === true}
                                        onChange={handleRadioChange}
                                        className="hidden"
                                    />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="include"
                                    >
                                        Includi i weekend
                                    </label>
                                </div>
                                <div
                                    onClick={() => setSelectedRadio(false)}
                                    className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        selectedRadio === false
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="turno"
                                        id="ignore"
                                        value={selectedRadio}
                                        checked={selectedRadio === false}
                                        onChange={handleRadioChange}
                                        className="hidden"
                                    />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="ignore"
                                    >
                                        Ignora i weekend
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row justify-between gap-4">
                                <div className="flex flex-col gap-1 w-full">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Da
                                    </h3>
                                    <input
                                        type="date"
                                        value={selectedFrom}
                                        onChange={(e) =>
                                            setSelectedFrom(e.target.value)
                                        }
                                        className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        A
                                    </h3>
                                    <input
                                        type="date"
                                        value={selectedTo}
                                        onChange={(e) =>
                                            setSelectedTo(e.target.value)
                                        }
                                        className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 ${
                                            dateError
                                                ? "border border-[var(--red)] focus:border-[var(--red)]"
                                                : "border border-[var(--light-primary)] focus:border-[var(--separator)]"
                                        }`}
                                    />
                                </div>
                            </div>
                            {dateError && (
                                <p className="text-[var(--red)] text-sm mt-1">
                                    La data di inizio deve essere precedente
                                    alla data di fine
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Seleziona utenti
                            </h3>
                            <div className="grid grid-cols-3 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                {users.map((user) => (
                                    <div
                                        key={user.Username}
                                        onClick={() =>
                                            handleCheckboxChange(user.Username)
                                        }
                                        className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                            selectedAssignees.includes(
                                                user.Username,
                                            )
                                                ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                                : "text-[var(--black)]"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name=""
                                            id={user.Username}
                                            checked={selectedAssignees.includes(
                                                user.Username,
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(
                                                    user.Username,
                                                )
                                            }
                                            className="hidden"
                                        />
                                        <UserIcon className="w-6" />
                                        <label
                                            className="cursor-pointer truncate"
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                    <button
                        className="btn gray-btn"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Chiudi
                    </button>

                    <button
                        className="btn"
                        onClick={applyPattern}
                        disabled={saving}
                    >
                        <p>{saving ? "Caricamento..." : "Salva"}</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShiftsPattern;

import { useState, useEffect } from "react";
import PatternIcon from "../../assets/icons/pattern.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import DeleteIcon from "../../assets/icons/delete.tsx";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI_variant/useEmployeeShifts.js";
import { usePatternShifts } from "../data/provider/patternShiftAPI/usePatternShifts.js";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";

function ShiftsPattern({ onClose, onPatternApply }) {
    const [activeTab, setActiveTab] = useState("Seleziona");
    const { users } = useUsers();
    const { employeeShifts } = useEmployeeShifts();
    const { patternShifts, addPatternShift, deletePatternShift } =
        usePatternShifts();
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
    const [titleError, setTitleError] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedAmount, setSelectedAmount] = useState(1);
    const [customShiftInputs, setCustomShiftInputs] = useState(["--"]);

    const shiftMeanings = [
        "O",
        "OP",
        "ON",
        "D",
        "N",
        "F",
        "M",
        "R",
        "C",
        "CA",
        "T",
        "P",
        "CG",
        "ND",
    ];

    const defaultPatterns = {
        "Shift Leader": ["O", "ON", "OP"],
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

    const getShiftValue = (shiftIndex) => {
        return customShiftInputs[shiftIndex] || "--";
    };

    const handleShiftChange = (shiftIndex, value) => {
        setCustomShiftInputs((prev) => {
            const newShifts = [...prev];
            newShifts[shiftIndex] = value;
            return newShifts;
        });
    };

    useEffect(() => {
        const amount = Number(selectedAmount);
        setCustomShiftInputs((prev) => {
            const newShifts = Array(amount).fill("--");
            // Preserve existing values where possible
            for (let i = 0; i < Math.min(prev.length, amount); i++) {
                newShifts[i] = prev[i];
            }
            return newShifts;
        });
    }, [selectedAmount]);

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    };

    const getPatternArray = (patternName) => {
        // Check if it's a default pattern
        if (defaultPatterns[patternName]) {
            return defaultPatterns[patternName];
        }
        // Check if it's a personalized pattern
        const personalizedPattern = patternShifts.find(
            (p) => p.NAME === patternName,
        );
        if (personalizedPattern && personalizedPattern.SHIFT_LIST) {
            return personalizedPattern.SHIFT_LIST.split(",");
        }
        return null;
    };

    const applyPattern = () => {
        // Validation
        if (!selectedPattern) {
            return;
        }

        const pattern = getPatternArray(selectedPattern);

        if (!pattern) {
            return;
        }

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
                            id: existingShift.ID || existingShift.id,
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

            // Prepare changes for save modal instead of directly saving
            const addOperations = shiftOperations.filter(
                (op) => op.type === "add",
            );
            const updateOperations = shiftOperations.filter(
                (op) => op.type === "update",
            );

            // Convert to postChanges and putChanges format
            const newPostChanges = {};
            const newPutChanges = {};

            addOperations.forEach((op) => {
                const key = `${op.data.EMPLOYEE_ID}-${op.data.SELECTED_DATE}`;
                newPostChanges[key] = op.data;
            });

            updateOperations.forEach((op) => {
                const key = `${op.data.EMPLOYEE_ID}-${op.data.SELECTED_DATE}`;
                newPutChanges[key] = {
                    ID: op.id,
                    ...op.data,
                };
            });

            // Trigger the save changes modal via callback
            if (onPatternApply) {
                onPatternApply(newPostChanges, newPutChanges);
            }

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
                    <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
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
                    </div>

                    {activeTab === "Seleziona" && (
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
                                    {patternShifts.map((patternShift) => {
                                        // Safety check for SHIFT_LIST
                                        if (!patternShift.SHIFT_LIST)
                                            return null;

                                        const pattern =
                                            patternShift.SHIFT_LIST.split(",");
                                        return (
                                            <div
                                                key={patternShift.ID}
                                                onClick={() =>
                                                    setSelectedPattern(
                                                        patternShift.NAME,
                                                    )
                                                }
                                                className={`flex items-center justify-between cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                                    selectedPattern ===
                                                    patternShift.NAME
                                                        ? "bg-[var(--light-primary)] transition-all duration-300"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {selectedPattern ===
                                                        patternShift.NAME && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deletePatternShift(
                                                                    patternShift.ID,
                                                                );
                                                                if (
                                                                    selectedPattern ===
                                                                    patternShift.NAME
                                                                ) {
                                                                    setSelectedPattern(
                                                                        null,
                                                                    );
                                                                }
                                                            }}
                                                            className="text-[var(--gray)] hover:text-[var(--red)] transition-all duration-200 p-1 shrink-0"
                                                            title="Elimina pattern"
                                                        >
                                                            <CloseIcon className="w-4" />
                                                        </button>
                                                    )}

                                                    <label
                                                        className={`cursor-pointer truncate transition-all duration-300 ${
                                                            selectedPattern ===
                                                            patternShift.NAME
                                                                ? "text-[var(--primary)]"
                                                                : "text-[var(--black)]"
                                                        }`}
                                                    >
                                                        {patternShift.NAME}
                                                    </label>
                                                </div>
                                                <label
                                                    className={`cursor-pointer text-xs truncate transition-all duration-300 ${
                                                        selectedPattern ===
                                                        patternShift.NAME
                                                            ? "text-[var(--black)]"
                                                            : "text-[var(--gray)]"
                                                    }`}
                                                >
                                                    {pattern.join(", ")}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedPattern &&
                                (() => {
                                    // Check if it's a default pattern
                                    const defaultPattern =
                                        defaultPatterns[selectedPattern];
                                    if (
                                        defaultPattern &&
                                        defaultPattern.length > 1
                                    ) {
                                        return (
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
                                                        setDuration(
                                                            e.target.value,
                                                        );
                                                    }}
                                                    className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 border border-[var(--light-primary)] focus:border-[var(--separator)]`}
                                                    placeholder="Inserisci il numero di cicli a settimana per turno (max. 7)"
                                                    required
                                                />
                                            </div>
                                        );
                                    }
                                    // Check if it's a personalized pattern
                                    const personalizedPattern =
                                        patternShifts.find(
                                            (p) => p.NAME === selectedPattern,
                                        );
                                    if (
                                        personalizedPattern &&
                                        personalizedPattern.SHIFT_LIST &&
                                        personalizedPattern.SHIFT_LIST.split(
                                            ",",
                                        ).length > 1
                                    ) {
                                        return (
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
                                                        setDuration(
                                                            e.target.value,
                                                        );
                                                    }}
                                                    className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 border border-[var(--light-primary)] focus:border-[var(--separator)]`}
                                                    placeholder="Inserisci il numero di cicli a settimana per turno (max. 7)"
                                                    required
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
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
                                                handleCheckboxChange(
                                                    user.Username,
                                                )
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
                                            <UserIcon className="w-6 shrink-0" />
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
                                                {user.Username.split(
                                                    ".",
                                                )[1] && (
                                                    <>
                                                        {" "}
                                                        {user.Username.split(
                                                            ".",
                                                        )[1]
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
                    )}

                    {activeTab === "Crea" ? (
                        <div className="flex flex-col gap-8 max-h-[calc(60vh-1rem)] overflow-y-auto pr-1">
                            <div className="flex flex-row flex-1 w-full justify-between gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Nome*
                                    </h3>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (
                                                titleError &&
                                                e.target.value.trim()
                                            ) {
                                                setTitleError(false);
                                            }
                                        }}
                                        className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 ${
                                            titleError
                                                ? "border border-[var(--red)] focus:border-[var(--red)]"
                                                : "border border-[var(--light-primary)] focus:border-[var(--separator)]"
                                        }`}
                                        placeholder="Inserisci il nome del pattern"
                                        maxLength={200}
                                        required
                                    />
                                    {titleError && (
                                        <p className="text-[var(--red)] text-sm mt-1">
                                            {titleError === "duplicate"
                                                ? "Esiste già un pattern con questo nome"
                                                : "Il nome è obbligatorio"}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 w-1/4">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Numero dei turni
                                    </h3>
                                    <div className="relative ">
                                        <select
                                            name=""
                                            id=""
                                            value={selectedAmount}
                                            onChange={(e) =>
                                                setSelectedAmount(
                                                    e.target.value,
                                                )
                                            }
                                            className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                        >
                                            {Array.from(
                                                { length: 14 },
                                                (_, i) => i + 1,
                                            ).map((num) => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                        <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Imposta il pattern
                                </h3>

                                <div className="border border-[var(--light-primary)] rounded-md p-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                                    {Array.from(
                                        { length: Number(selectedAmount) },
                                        (_, i) => i,
                                    ).map((shiftIndex) => (
                                        <div
                                            key={shiftIndex}
                                            className="relative"
                                        >
                                            <select
                                                value={getShiftValue(
                                                    shiftIndex,
                                                )}
                                                onChange={(e) =>
                                                    handleShiftChange(
                                                        shiftIndex,
                                                        e.target.value,
                                                    )
                                                }
                                                className={`px-8 py-2 font-bold text-center text-lg border border-[var(--light-primary)] rounded-md hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer ${GetColorForShift(getShiftValue(shiftIndex))} ${getShiftValue(shiftIndex) === "R" ? "focus:text-black" : ""} ${getShiftValue(shiftIndex) === "ND" ? "focus:text-black" : ""}`}
                                            >
                                                <option value="--">--</option>
                                                {shiftMeanings.map((value) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {value === "CG"
                                                            ? "C"
                                                            : value}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                    <button
                        className="btn gray-btn"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Chiudi
                    </button>

                    {activeTab === "Seleziona" ? (
                        <button
                            className="btn"
                            onClick={applyPattern}
                            disabled={saving}
                        >
                            <p>{saving ? "Caricamento..." : "Salva"}</p>
                        </button>
                    ) : (
                        <button
                            className="btn"
                            onClick={async () => {
                                if (!title.trim()) {
                                    setTitleError(true);
                                    return;
                                }

                                // Check for duplicate pattern name
                                const isDuplicate =
                                    // Check in default patterns
                                    Object.keys(defaultPatterns).some(
                                        (patternName) =>
                                            patternName.toLowerCase() ===
                                            title.trim().toLowerCase(),
                                    ) ||
                                    // Check in personalized patterns from DB
                                    patternShifts.some(
                                        (pattern) =>
                                            pattern.NAME.toLowerCase() ===
                                            title.trim().toLowerCase(),
                                    );

                                if (isDuplicate) {
                                    setTitleError("duplicate");
                                    return;
                                }

                                setTitleError(false);
                                setSaving(true);
                                const shift_list = customShiftInputs
                                    .filter((s) => s !== "--")
                                    .join(",");
                                const result = await addPatternShift(
                                    title,
                                    shift_list,
                                    "Personalized",
                                );
                                setSaving(false);
                                if (result.success) {
                                    setTitle("");
                                    setCustomShiftInputs(["--"]);
                                    setSelectedAmount(1);
                                    setActiveTab("Seleziona");
                                }
                            }}
                            disabled={saving}
                        >
                            <p>{saving ? "Caricamento..." : "Aggiungi"}</p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ShiftsPattern;

/* if (!title.trim()) {
    setTitleError(true);
    return;
}
setTitleError(false); */

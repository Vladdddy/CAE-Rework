import { useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import { useTasks } from "../data/provider/taskAPI/useTasks.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { CheckExistingDays } from "../../functions/CheckExistingDays.jsx";

function CreateModal({ onClose, onSuccess }) {
    const { addTask } = useTasks();
    const { users } = useUsers();
    const [selectedCategory, setSelectedCategory] = useState("Routine Task");
    const [selectedStatus, setSelectedStatus] = useState("Da definire");
    const [selectedRadio, setSelectedRadio] = useState("Diurno");
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("PM");
    const [selectedDetail, setSelectedDetail] = useState("VISUAL");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [titleError, setTitleError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [dateNotFoundError, setDateNotFoundError] = useState(false);
    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState(
        simulators[0] || "",
    );
    const [selectedDays, setSelectedDays] = useState(["Ogni Giorno"]);
    const [activeTab, setActiveTab] = useState("Ordinaria");
    const [selectedFrom, setSelectedFrom] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [selectedTo, setSelectedTo] = useState(
        new Date().toISOString().split("T")[0],
    );

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);
    };

    const handleCheckboxChange = (name) => {
        setSelectedAssignees((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name],
        );
    };

    const handleCheckboxDays = (day) => {
        const specificDays = [
            "Lunedì",
            "Martedì",
            "Mercoledì",
            "Giovedì",
            "Venerdì",
            "Sabato",
            "Domenica",
        ];

        if (day === "Ogni Giorno") {
            setSelectedDays(["Ogni Giorno"]);
        } else {
            setSelectedDays((prev) => {
                const filteredPrev = prev.filter(
                    (item) => item !== "Ogni Giorno",
                );

                let newDays;
                if (filteredPrev.includes(day)) {
                    newDays = filteredPrev.filter((item) => item !== day);
                } else {
                    newDays = [...filteredPrev, day];
                }

                const allSpecificDaysSelected = specificDays.every((d) =>
                    newDays.includes(d),
                );
                if (allSpecificDaysSelected) {
                    return ["Ogni Giorno"];
                }

                return newDays;
            });
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setTitleError(true);
            return;
        }
        setTitleError(false);

        if (activeTab === "Ordinaria") {
            const newTask = {
                title: title,
                description: description,
                category: selectedCategory,
                subcategory: selectedSubCategory,
                extradetail: selectedDetail,
                simulator: selectedSimulator,
                date: selectedDate,
                time: selectedRadio,
                assigned_to: selectedAssignees.join(", ") || null,
                status: selectedStatus || "Da definire",
                type: activeTab,
                start_date: null,
                end_date: null,
                selected_days: null,
            };

            console.log("New Task:", newTask);

            const result = await addTask(newTask);
            onClose();
            if (onSuccess) {
                onSuccess(
                    result.success,
                    result.success
                        ? "Hai creato la task con successo"
                        : "Errore durante la creazione della task",
                );
            }
            return;
        }

        if (selectedFrom > selectedTo) {
            setDateError(true);
            return;
        }
        setDateError(false);

        if (selectedDays.length === 0) {
            setDateNotFoundError(true);
            return;
        }

        const existingDaysList = CheckExistingDays(
            selectedDays.join(","),
            selectedFrom,
            selectedTo,
        );

        console.log("Existing Days:", existingDaysList);

        if (existingDaysList.length === 0) {
            setDateNotFoundError(true);
            return;
        }
        setDateNotFoundError(false);

        const results = await Promise.all(
            existingDaysList.map(async (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const formattedDate = `${year}-${month}-${day}`;

                const newRecurringTask = {
                    title: title,
                    description: description,
                    category: selectedCategory,
                    subcategory: selectedSubCategory,
                    extradetail: selectedDetail,
                    simulator: selectedSimulator,
                    date: formattedDate,
                    time: selectedRadio,
                    assigned_to: selectedAssignees.join(", ") || null,
                    status: selectedStatus || "Da definire",
                    type: activeTab,
                    start_date: selectedFrom,
                    end_date: selectedTo,
                    selected_days: selectedDays.join(","),
                };

                console.log("New Recurring Task Date:", newRecurringTask.date);
                return await addTask(newRecurringTask);
            }),
        );

        const allSuccessful = results.every((result) => result.success);

        onClose();
        if (onSuccess) {
            onSuccess(
                allSuccessful,
                allSuccessful
                    ? `Hai creato ${existingDaysList.length} task con successo`
                    : "Errore durante la creazione di alcune task",
            );
        }
    };

    const categories = {
        "Routine Task": [
            "PM",
            "MR",
            "Backup",
            "QTG",
            "FMS & Parsing",
            "First AID check",
            "Refill DPI",
            "Toolbox check",
            "STG",
        ],
        Investigation: ["HW", "SW"],
        "Recurrent Issues": ["HW", "SW"],
        Troubleshooting: ["HW", "SW"],
        Others: [
            "Part test",
            "Remote connection with support",
            "Remote connection without support",
            "On-Site Connection",
        ],
    };

    const troubleshootingDetails = [
        "VISUAL",
        "COMPUTER",
        "AVIONIC",
        "ENV",
        "BUILDING",
        "POWER LOSS",
        "MOTION",
        "INTERFACE",
        "CONTROLS",
        "VIBRATION",
        "SOUND",
        "COMMS",
        "IOS",
        "OTHERS",
    ];

    const weekDays = [
        "Ogni Giorno",
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
        "Domenica",
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <TaskIcon className="w-6" />
                        <h1 className="text-xl">Crea task</h1>
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
                                activeTab === "Ordinaria"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => setActiveTab("Ordinaria")}
                        >
                            <p className="text-sm">Task Ordinaria</p>
                        </div>

                        <div
                            className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTab === "Ricorrente"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => {
                                setActiveTab("Ricorrente");
                            }}
                        >
                            <p className="text-sm">Task Ricorrente</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 max-h-[calc(60vh-1rem)] overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Titolo*
                            </h3>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (titleError && e.target.value.trim()) {
                                        setTitleError(false);
                                    }
                                }}
                                className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 ${
                                    titleError
                                        ? "border border-[var(--red)] focus:border-[var(--red)]"
                                        : "border border-[var(--light-primary)] focus:border-[var(--separator)]"
                                }`}
                                placeholder="Inserisci il titolo del task"
                                maxLength={200}
                                required
                            />
                            {titleError && (
                                <p className="text-[var(--red)] text-sm mt-1">
                                    Il titolo è obbligatorio
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Descrizione
                            </h3>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full min-h-[100px] p-3 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] resize-y focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                placeholder="Inserisci note aggiuntive qui..."
                                required
                            ></textarea>
                        </div>

                        {/*<div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Allegati</h3>

                        
                        <input
                            type="file"
                            name=""
                            id=""
                            multiple
                            className="border border-[var(--light-primary)] rounded-md p-2 text-[var(--black)] cursor-pointer hover:text-[var(--gray)] hover:border-[var(--separator)] transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-md file:bg-[var(--primary)] file:text-[#ffffff] file:cursor-pointer hover:file:bg-[var(--primary-hover)]"
                        />
                        
                    </div>*/}

                        <div className="flex flex-col gap-1 w-1/2">
                            <h3 className="text-sm text-[var(--gray)]">
                                Stato
                            </h3>
                            <div className="relative ">
                                <select
                                    name=""
                                    id=""
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                >
                                    <option value="Da definire">
                                        Da definire
                                    </option>
                                    <option value="In corso">In corso</option>
                                    <option value="Completato">
                                        Completato
                                    </option>
                                    <option value="Non completato">
                                        Non completato
                                    </option>
                                    <option value="Non iniziato">
                                        Non iniziato
                                    </option>
                                </select>
                                <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-row gap-4 justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Categoria
                                </h3>
                                <div className="relative ">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        {Object.keys(categories).map(
                                            (category, index) => (
                                                <option
                                                    key={index}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Sotto-Categoria
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedSubCategory}
                                        onChange={(e) =>
                                            setSelectedSubCategory(
                                                e.target.value,
                                            )
                                        }
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        {categories[selectedCategory]?.map(
                                            (subCategory, index) => (
                                                <option
                                                    key={index}
                                                    value={subCategory}
                                                >
                                                    {subCategory}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Dettaglio Extra
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedDetail}
                                        onChange={(e) =>
                                            setSelectedDetail(e.target.value)
                                        }
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        {troubleshootingDetails.map(
                                            (detail, index) => (
                                                <option
                                                    key={index}
                                                    value={detail}
                                                >
                                                    {detail}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Simulatore
                            </h3>
                            <div className="relative">
                                <select
                                    name=""
                                    id=""
                                    value={selectedSimulator}
                                    onChange={(e) =>
                                        setSelectedSimulator(e.target.value)
                                    }
                                    className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                >
                                    {simulators.map((simulator, index) => (
                                        <option key={index} value={simulator}>
                                            {simulator}
                                        </option>
                                    ))}
                                </select>
                                <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                            </div>
                        </div>

                        {activeTab === "Ordinaria" && (
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Data
                                </h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(e.target.value)
                                    }
                                    className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                />
                            </div>
                        )}

                        {activeTab === "Ricorrente" && (
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
                        )}

                        {activeTab === "Ricorrente" && (
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Giorni della settimana
                                </h3>
                                <div className="grid grid-cols-3 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                    {weekDays.map((day) => (
                                        <div
                                            key={day}
                                            onClick={() =>
                                                handleCheckboxDays(day)
                                            }
                                            className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                                selectedDays.includes(day)
                                                    ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                                    : "text-[var(--black)]"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="weekDays"
                                                id={day}
                                                checked={selectedDays.includes(
                                                    day,
                                                )}
                                                onChange={() =>
                                                    handleCheckboxDays(day)
                                                }
                                                className="hidden"
                                            />
                                            <label
                                                className="cursor-pointer truncate"
                                                htmlFor={day}
                                            >
                                                {day}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {dateNotFoundError && (
                                    <p className="text-[var(--red)] text-sm mt-1">
                                        Nessuna data trovata per i giorni
                                        selezionati
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Turno
                            </h3>
                            <div className="flex flex-row items-center gap-1 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                <div
                                    onClick={() => setSelectedRadio("Diurno")}
                                    className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        selectedRadio === "Diurno"
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="turno"
                                        id="Diurno"
                                        value="Diurno"
                                        checked={selectedRadio === "Diurno"}
                                        onChange={handleRadioChange}
                                        className="hidden"
                                    />
                                    <DayIcon className="w-6" />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="Diurno"
                                    >
                                        Diurno
                                    </label>
                                </div>
                                <div
                                    onClick={() => setSelectedRadio("Notturno")}
                                    className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        selectedRadio === "Notturno"
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="turno"
                                        id="Notturno"
                                        value="Notturno"
                                        checked={selectedRadio === "Notturno"}
                                        onChange={handleRadioChange}
                                        className="hidden"
                                    />
                                    <NightIcon className="w-6" />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="Notturno"
                                    >
                                        Notturno
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Assegnatario/i
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
                    <button className="btn gray-btn" onClick={onClose}>
                        Chiudi
                    </button>

                    <button className="btn" onClick={handleSubmit}>
                        <p>Salva</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateModal;

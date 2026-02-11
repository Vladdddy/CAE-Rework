import React, { useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/taskAPI/useTasks.js";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { useNotes } from "../data/provider/noteAPI/useNotes.js";
import { useNoteLogbooks } from "../data/provider/noteLogbookAPI/useNoteLogbooks.js";

function ModifyModal({ onClose, onSuccess, task, isConverting = false }) {
    const [selectedCategory, setSelectedCategory] = useState(
        task.CATEGORY || "Routine Task",
    );
    const [selectedStatus, setSelectedStatus] = useState(
        task.STATUS || "Da definire",
    );
    const [selectedRadio, setSelectedRadio] = useState(task.TIME || "Diurno");
    const [selectedAssignees, setSelectedAssignees] = useState(
        task.ASSIGNED_TO
            ? typeof task.ASSIGNED_TO === "string"
                ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                : task.ASSIGNED_TO
            : [],
    );
    const [title, setTitle] = useState(task.TITLE || "");
    const [description, setDescription] = useState(task.DESCRIPTION || "");
    const [selectedSubCategory, setSelectedSubCategory] = useState(
        task.SUBCATEGORY || "PM",
    );
    const [selectedDetail, setSelectedDetail] = useState(
        task.EXTRADETAIL || "VISUAL",
    );
    const [selectedDate, setSelectedDate] = useState(
        task.DATE
            ? task.DATE.split("T")[0]
            : new Date().toISOString().split("T")[0],
    );
    const [titleError, setTitleError] = useState(false);
    const { createNote } = useNotes();
    const { createNoteLogbook } = useNoteLogbooks();
    // eslint-disable-next-line no-unused-vars
    const [noteDescription, setNoteDescription] = useState("");
    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState(
        task.SIMULATOR || simulators[0],
    );
    const { updateTask, addTask } = useTasks();
    const { updateLogbook, deleteLogbook } = useLogbooks();
    const { users, currentUserId } = useUsers();

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

    const generateChangeMessage = () => {
        const changes = [];
        const taskType = task.ISLOGBOOK ? "entry" : "task";

        // Check assigned users change
        const originalAssignees = task.ASSIGNED_TO
            ? typeof task.ASSIGNED_TO === "string"
                ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                : task.ASSIGNED_TO
            : [];
        const newAssignees = selectedAssignees;

        if (
            JSON.stringify(originalAssignees.sort()) !==
            JSON.stringify(newAssignees.sort())
        ) {
            const fromUsers =
                originalAssignees.length > 0
                    ? `"${originalAssignees.join('", "')}"`
                    : "nessuno";
            const toUsers =
                newAssignees.length > 0
                    ? `"${newAssignees.join('", "')}"`
                    : "nessuno";
            changes.push(
                `riassegnato la ${taskType} da ${fromUsers} a ${toUsers}`,
            );
        }

        // Check date change
        const originalDate = task.DATE ? task.DATE.split("T")[0] : "";
        if (originalDate !== selectedDate) {
            const formatDate = (dateStr) => {
                const [year, month, day] = dateStr.split("-");
                return `${year}/${month}/${day}`;
            };
            changes.push(
                `cambiato la data da ${formatDate(originalDate)} a ${formatDate(selectedDate)}`,
            );
        }

        // Check time/shift change
        if (task.TIME !== selectedRadio) {
            changes.push(
                `cambiato il turno da "${task.TIME}" a "${selectedRadio}"`,
            );
        }

        // Check status change
        if (task.STATUS !== selectedStatus) {
            changes.push(
                `cambiato lo stato da "${task.STATUS}" a "${selectedStatus}"`,
            );
        }

        // Check title change
        if (task.TITLE !== title) {
            changes.push(`cambiato il titolo da "${task.TITLE}" a "${title}"`);
        }

        // Check description change
        if (task.DESCRIPTION !== description) {
            changes.push(`modificato la descrizione`);
        }

        // Check category change
        if (task.CATEGORY !== selectedCategory) {
            changes.push(
                `cambiato la categoria da "${task.CATEGORY}" a "${selectedCategory}"`,
            );
        }

        // Check subcategory change
        if (task.SUBCATEGORY !== selectedSubCategory) {
            changes.push(
                `cambiato la sotto-categoria da "${task.SUBCATEGORY}" a "${selectedSubCategory}"`,
            );
        }

        // Check extradetail change
        if (task.EXTRADETAIL !== selectedDetail) {
            changes.push(
                `cambiato il dettaglio extra da "${task.EXTRADETAIL}" a "${selectedDetail}"`,
            );
        }

        // Check simulator change
        if (task.SIMULATOR !== selectedSimulator) {
            changes.push(
                `cambiato il simulatore da "${task.SIMULATOR}" a "${selectedSimulator}"`,
            );
        }

        if (changes.length === 0) {
            return `Ha modificato la ${taskType}`;
        } else if (changes.length === 1) {
            return `Ha ${changes[0]}`;
        } else {
            // Capitalize first letter
            const firstChange =
                changes[0].charAt(0).toUpperCase() + changes[0].slice(1);
            return `Ha ${firstChange}, ${changes.slice(1).join(", ")}`;
        }
    };

    const handleModify = async () => {
        console.log(`Modifying task with ID: ${task.ID}`);

        const isLogbook = task.ISLOGBOOK;

        if (!title.trim()) {
            setTitleError(true);
            return;
        }

        setTitleError(false);
        const modifiedTask = {
            title: title,
            description: description,
            category: selectedCategory,
            subcategory: selectedSubCategory,
            extradetail: selectedDetail,
            simulator: selectedSimulator,
            date: selectedDate,
            time: selectedRadio,
            assigned_to: selectedAssignees.join(", ") || null,
            status: selectedStatus,
        };

        // Handle conversion from logbook to task
        if (isConverting && isLogbook) {
            // Create a new task with the logbook data
            const createResult = await addTask(modifiedTask);

            if (createResult.success) {
                // Delete the original logbook
                const deleteResult = await deleteLogbook(task.ID);

                onClose();

                if (onSuccess) {
                    onSuccess(
                        deleteResult.success,
                        deleteResult.success
                            ? `Entry "${title}" convertita in Task con successo`
                            : "Errore durante la conversione in Task",
                    );
                }
                return;
            } else {
                onClose();
                if (onSuccess) {
                    onSuccess(false, "Errore durante la creazione della Task");
                }
                return;
            }
        }

        // Normal modification flow
        const result = isLogbook
            ? await updateLogbook(task.ID, modifiedTask)
            : await updateTask(task.ID, modifiedTask);

        if (result.success) {
            const changeMessage = generateChangeMessage();
            const changedTaskNote = isLogbook
                ? await createNoteLogbook(
                      task.ID,
                      currentUserId,
                      changeMessage,
                      "automatico",
                  )
                : await createNote(
                      task.ID,
                      currentUserId,
                      changeMessage,
                      "automatico",
                  );

            if (changedTaskNote.success) {
                setNoteDescription("");
            }
        }

        console.log("Passing modified task:", modifiedTask);

        onClose();

        if (onSuccess) {
            onSuccess(
                result.success,
                result.success
                    ? "Hai modificato la task con successo"
                    : "Errore durante la modifica della task",
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <TaskIcon className="w-6" />
                        <h1 className="text-xl">Modifica task #{task.ID}</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8 max-h-[calc(60vh-1rem)] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Titolo*</h3>
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

                    <div className="flex flex-col gap-1 w-1/2">
                        <h3 className="text-sm text-[var(--gray)]">Stato</h3>
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
                                <option value="Da definire">Da definire</option>
                                <option value="In corso">In corso</option>
                                <option value="Completato">Completato</option>
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
                                        setSelectedSubCategory(e.target.value)
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
                                            <option key={index} value={detail}>
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

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Data</h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Turno</h3>
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
                                            handleCheckboxChange(user.Username)
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
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                    <button className="btn gray-btn" onClick={onClose}>
                        Chiudi
                    </button>

                    <button className="btn" onClick={handleModify}>
                        <p>Salva modifiche</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModifyModal;

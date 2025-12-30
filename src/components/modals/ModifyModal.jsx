import React, { useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/useTasks.js";

function ModifyModal({ onClose, onSuccess, task }) {
    const [selectedCategory, setSelectedCategory] = useState(
        task.CATEGORY || "Routine Task"
    );
    const [selectedStatus, setSelectedStatus] = useState(
        task.STATUS || "Da definire"
    );
    const [selectedRadio, setSelectedRadio] = useState(task.TIME || "Diurno");
    const [selectedAssignees, setSelectedAssignees] = useState(
        task.ASSIGNED_TO
            ? typeof task.ASSIGNED_TO === "string"
                ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                : task.ASSIGNED_TO
            : []
    );
    const [title, setTitle] = useState(task.TITLE || "");
    const [description, setDescription] = useState(task.DESCRIPTION || "");
    const [selectedSubCategory, setSelectedSubCategory] = useState(
        task.SUBCATEGORY || "PM"
    );
    const [selectedDetail, setSelectedDetail] = useState(
        task.EXTRADETAIL || "VISUAL"
    );
    const [selectedDate, setSelectedDate] = useState(
        task.DATE
            ? task.DATE.split("T")[0]
            : new Date().toISOString().split("T")[0]
    );
    const [titleError, setTitleError] = useState(false);

    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState(
        task.SIMULATOR || simulators[0]
    );
    const { updateTask } = useTasks();

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);
    };

    const handleCheckboxChange = (name) => {
        setSelectedAssignees((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name]
        );
    };

    const handleModify = async () => {
        console.log(`Modifying task with ID: ${task.ID}`);

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

        const result = await updateTask(task.ID, modifiedTask);

        console.log("Passing modified task:", modifiedTask);

        onClose();

        if (onSuccess) {
            onSuccess(
                result.success,
                result.success
                    ? "Hai modificato la task con successo"
                    : "Errore durante la modifica della task"
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
                                        )
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
                                        )
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
                                        )
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
                            <div
                                onClick={() => handleCheckboxChange("Mario1")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario1")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario1"
                                    checked={selectedAssignees.includes(
                                        "Mario1"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario1")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario1"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario2")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario2")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario2"
                                    checked={selectedAssignees.includes(
                                        "Mario2"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario2")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario2"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario3")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario3")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario3"
                                    checked={selectedAssignees.includes(
                                        "Mario3"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario3")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario3"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario4")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario4")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario4"
                                    checked={selectedAssignees.includes(
                                        "Mario4"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario4")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario4"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario5")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario5")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario5"
                                    checked={selectedAssignees.includes(
                                        "Mario5"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario5")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario5"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario6")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario6")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario6"
                                    checked={selectedAssignees.includes(
                                        "Mario6"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario6")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario6"
                                >
                                    Mario
                                </label>
                            </div>
                            <div
                                onClick={() => handleCheckboxChange("Mario7")}
                                className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                    selectedAssignees.includes("Mario7")
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name=""
                                    id="Mario7"
                                    checked={selectedAssignees.includes(
                                        "Mario7"
                                    )}
                                    onChange={() =>
                                        handleCheckboxChange("Mario7")
                                    }
                                    className="hidden"
                                />
                                <UserIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Mario7"
                                >
                                    Mario
                                </label>
                            </div>
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

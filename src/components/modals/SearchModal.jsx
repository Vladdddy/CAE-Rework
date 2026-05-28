import React, { useState, useMemo, useRef, useEffect } from "react";
import SearchIcon from "../../assets/icons/search.tsx";
import FilterIcon from "../../assets/icons/filter.tsx";
import ArrowIcon from "../../assets/icons/arrow-left.tsx";
import Task from "../data/Task.jsx";
import { useTasks } from "../data/provider/taskAPI/useTasks";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks";
import { useTaskSimOne } from "../data/provider/taskSimOneAPI/useTaskSimOne";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import { useUsers } from "../../components/data/provider/userAPI/useUsers";
import { useNotes } from "../data/provider/noteAPI/useNotes";
import { useNoteLogbooks } from "../data/provider/noteLogbookAPI/useNoteLogbooks";

const SIMULATOR_MAP = {
    1: "109FFS",
    2: "FTD",
    3: "139#1",
    4: "139#3",
    5: "169",
    6: "189",
    13: "109FFS",
};

function SearchModal({ onClose, onDeleteSuccess }) {
    const { tasks, loading, fetchTasks } = useTasks();
    const currentMonthName = new Date().toLocaleString("default", {
        month: "long",
    });
    const { logbooks, loading: logbooksLoading, fetchLogbooks } = useLogbooks();
    const {
        currentMonthTasks,
        currentMonthLoading: pmLoading,
        fetchCurrentMonthTasks,
    } = useTaskSimOne();
    const { notes, fetchAllNotes } = useNotes();
    const { noteLogbooks, fetchAllNoteLogbooks } = useNoteLogbooks();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSimulator, setSelectedSimulator] = useState("");
    const [selectedFrom, setSelectedFrom] = useState("");
    const [selectedTo, setSelectedTo] = useState("");
    const [dateError, setDateError] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const inputRef = useRef(null);
    const simulators = GetSimulatorsList();
    const { users, currentUserRole } = useUsers();

    useEffect(() => {
        inputRef.current?.focus();
        fetchAllNotes();
        fetchAllNoteLogbooks();
        fetchCurrentMonthTasks();
    }, [fetchAllNotes, fetchAllNoteLogbooks, fetchCurrentMonthTasks]);

    useEffect(() => {
        if (selectedFrom && selectedTo) {
            setDateError(new Date(selectedFrom) > new Date(selectedTo));
        } else {
            setDateError(false);
        }
    }, [selectedFrom, selectedTo]);

    const handleDeleteSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
            await fetchLogbooks();
        }
        if (onDeleteSuccess) {
            onDeleteSuccess(isSuccess, message);
        }
    };

    const formatUsername = (user) => {
        if (!user) return "";
        const first = (user.firstname || "").trim();
        const last = (user.lastname || "").trim();
        if (first || last) {
            return [
                first ? first.charAt(0).toUpperCase() + first.slice(1) : "",
                last ? last.charAt(0).toUpperCase() + last.slice(1) : "",
            ]
                .filter(Boolean)
                .join(" ");
        }
        return user.Username || (user.FullName || "").trim() || "";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((task) => {
                // Check if task fields match
                const taskMatches =
                    task.TITLE?.toLowerCase().includes(query) ||
                    task.DESCRIPTION?.toLowerCase().includes(query) ||
                    task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                    task.STATUS?.toLowerCase().includes(query);

                // Check if any of the task's notes match
                const noteMatches = notes?.some(
                    (note) =>
                        note.TASKID === task.ID &&
                        note.TYPE === "creato" &&
                        note.DESCRIPTION?.toLowerCase().includes(query),
                );

                return taskMatches || noteMatches;
            });
        }

        // Apply status filter
        if (selectedStatus) {
            filtered = filtered.filter(
                (task) => task.STATUS === selectedStatus,
            );
        }

        // Apply simulator filter
        if (selectedSimulator) {
            filtered = filtered.filter(
                (task) => task.SIMULATOR === selectedSimulator,
            );
        }

        // Apply assignee filter
        if (selectedAssignees) {
            filtered = filtered.filter((task) =>
                task.ASSIGNED_TO?.toLowerCase().includes(
                    selectedAssignees.toLowerCase(),
                ),
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(
                (task) => task.CATEGORY === selectedCategory,
            );
        }

        // Apply subcategory filter
        if (selectedSubCategory) {
            filtered = filtered.filter(
                (task) => task.SUBCATEGORY === selectedSubCategory,
            );
        }

        // Apply date range filter
        if (selectedFrom && !dateError) {
            const fromDate = new Date(selectedFrom);
            filtered = filtered.filter((task) => {
                const taskDate = new Date(task.DATE);
                return taskDate >= fromDate;
            });
        }

        if (selectedTo && !dateError) {
            const toDate = new Date(selectedTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((task) => {
                const taskDate = new Date(task.DATE);
                return taskDate <= toDate;
            });
        }

        return filtered.sort((a, b) => new Date(b.DATE) - new Date(a.DATE));
    }, [
        tasks,
        searchQuery,
        selectedStatus,
        selectedSimulator,
        selectedAssignees,
        selectedCategory,
        selectedSubCategory,
        selectedFrom,
        selectedTo,
        dateError,
        notes,
    ]);

    const filteredLogbooks = useMemo(() => {
        let filtered = logbooks;

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((logbook) => {
                // Check if logbook fields match
                const logbookMatches =
                    logbook.TITLE?.toLowerCase().includes(query) ||
                    logbook.DESCRIPTION?.toLowerCase().includes(query) ||
                    logbook.ASSIGNED_TO?.toLowerCase().includes(query) ||
                    logbook.STATUS?.toLowerCase().includes(query);

                // Check if any of the logbook's notes match
                const noteMatches = noteLogbooks?.some(
                    (note) =>
                        note.LOGBOOKID === logbook.ID &&
                        note.TYPE === "creato" &&
                        note.DESCRIPTION?.toLowerCase().includes(query),
                );

                return logbookMatches || noteMatches;
            });
        }

        // Apply status filter
        if (selectedStatus) {
            filtered = filtered.filter(
                (logbook) => logbook.STATUS === selectedStatus,
            );
        }

        // Apply simulator filter
        if (selectedSimulator) {
            filtered = filtered.filter(
                (logbook) => logbook.SIMULATOR === selectedSimulator,
            );
        }

        // Apply assignee filter
        if (selectedAssignees) {
            filtered = filtered.filter((logbook) =>
                logbook.ASSIGNED_TO?.toLowerCase().includes(
                    selectedAssignees.toLowerCase(),
                ),
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(
                (logbook) => logbook.CATEGORY === selectedCategory,
            );
        }

        // Apply subcategory filter
        if (selectedSubCategory) {
            filtered = filtered.filter(
                (logbook) => logbook.SUBCATEGORY === selectedSubCategory,
            );
        }

        // Apply date range filter
        if (selectedFrom && !dateError) {
            const fromDate = new Date(selectedFrom);
            filtered = filtered.filter((logbook) => {
                const logbookDate = new Date(logbook.DATE);
                return logbookDate >= fromDate;
            });
        }

        if (selectedTo && !dateError) {
            const toDate = new Date(selectedTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((logbook) => {
                const logbookDate = new Date(logbook.DATE);
                return logbookDate <= toDate;
            });
        }

        return filtered.sort((a, b) => new Date(b.DATE) - new Date(a.DATE));
    }, [
        logbooks,
        searchQuery,
        selectedStatus,
        selectedSimulator,
        selectedAssignees,
        selectedCategory,
        selectedSubCategory,
        selectedFrom,
        selectedTo,
        dateError,
        noteLogbooks,
    ]);

    const normalizedPmTasks = useMemo(() => {
        return (currentMonthTasks || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                return simulatorId && SIMULATOR_MAP[simulatorId];
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                const taskDone = task["Task done"] ?? task["Task Done"];
                const isDone =
                    taskDone !== undefined &&
                    taskDone !== null &&
                    Boolean(taskDone);
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] || "PM Task",
                    DATE: task["Scheduled on"] ?? task.DATE,
                    ASSIGNED_TO:
                        task["Task Performed By"] || task["Tech id"] || "",
                    STATUS: isDone ? "Completato" : "Non completato",
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: "Notturno",
                    IS_PM_PLAN_TASK: true,
                };
            });
    }, [currentMonthTasks]);

    const filteredPmTasks = useMemo(() => {
        let filtered = normalizedPmTasks;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.TITLE?.toLowerCase().includes(query) ||
                    task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                    task.STATUS?.toLowerCase().includes(query) ||
                    task.SIMULATOR?.toLowerCase().includes(query),
            );
        }

        if (selectedStatus) {
            filtered = filtered.filter(
                (task) => task.STATUS === selectedStatus,
            );
        }

        if (selectedSimulator) {
            filtered = filtered.filter(
                (task) => task.SIMULATOR === selectedSimulator,
            );
        }

        if (selectedAssignees) {
            filtered = filtered.filter((task) =>
                task.ASSIGNED_TO?.toLowerCase().includes(
                    selectedAssignees.toLowerCase(),
                ),
            );
        }

        if (selectedFrom && !dateError) {
            const fromDate = new Date(selectedFrom);
            filtered = filtered.filter(
                (task) => new Date(task.DATE) >= fromDate,
            );
        }

        if (selectedTo && !dateError) {
            const toDate = new Date(selectedTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((task) => new Date(task.DATE) <= toDate);
        }

        return filtered.sort((a, b) => new Date(b.DATE) - new Date(a.DATE));
    }, [
        normalizedPmTasks,
        searchQuery,
        selectedStatus,
        selectedSimulator,
        selectedAssignees,
        selectedFrom,
        selectedTo,
        dateError,
    ]);

    const showFiltersFunction = () => {
        setShowFilters(!showFilters);
    };

    const categories = {
        "Routine Task": [
            "PM",
            "MR",
            "DR",
            "MDR",
            "FDR",
            "Backup",
            "QTG",
            "FMS & Parsing",
            "First AID check",
            "Refill DPI",
            "Toolbox check",
            "STG",
            "RoRo",
            "Load Eval",
            "Pre-Cert",
            "Certification",
        ],
        COMMENT: [],
        BUILDING: [],
        "SL NOTE": [],
        "Recurrent Issues": ["HW", "SW"],
        Troubleshooting: ["HW", "SW"],
        Others: [
            "Part test",
            "Remote connection with support",
            "Remote connection without support",
            "On-Site Connection",
            "Part Repaired",
            "EXTRA TASK",
        ],
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-2 pt-3 sm:p-3 md:pt-16"
            onClick={onClose}
        >
            <div
                className="max-w-5xl w-full h-full md:h-auto md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                        onClick={onClose}
                        className="bg-[var(--bento-bg)] p-2 rounded-md hover:bg-[var(--light-primary)] transition text-[var(--gray)] border border-[var(--light-primary)] shrink-0"
                    >
                        <ArrowIcon className="w-6" />
                    </button>
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                        <input
                            ref={inputRef}
                            type="search"
                            placeholder="Cerca task"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                        />
                    </div>
                    <div
                        className="flex items-center bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-md p-2 cursor-pointer transition-all duration-200 shrink-0"
                        onClick={showFiltersFunction}
                    >
                        <FilterIcon className="w-6 text-[var(--black)] icon cursor-pointer" />
                    </div>
                </div>

                {showFilters && (
                    <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-3 sm:p-4 bg-[var(--bento-bg)] mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Stato
                                </h3>

                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            setSelectedStatus(e.target.value);
                                        }}
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>

                                        <option value="In corso">
                                            In corso
                                        </option>
                                        <option value="Completato">
                                            Completato
                                        </option>
                                        <option value="Rischedulato">
                                            Rischedulato
                                        </option>
                                        <option value="Convertito in task">
                                            Convertito in task
                                        </option>
                                        <option value="Non completato">
                                            Non completato
                                        </option>
                                        <option value="Da definire">
                                            Da definire
                                        </option>
                                        {(currentUserRole === "Admin" ||
                                            currentUserRole ===
                                                "Shift Leader") && (
                                            <option value="Completato da SL">
                                                Completato da SL
                                            </option>
                                        )}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Simulatore
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedSimulator}
                                        onChange={(e) => {
                                            setSelectedSimulator(
                                                e.target.value,
                                            );
                                        }}
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>
                                        {simulators.map((simulator, index) => (
                                            <option
                                                key={index}
                                                value={simulator}
                                            >
                                                {simulator}
                                            </option>
                                        ))}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Assegnatario
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedAssignees}
                                        onChange={(e) => {
                                            setSelectedAssignees(
                                                e.target.value,
                                            );
                                        }}
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>
                                        {users.map((user, index) => (
                                            <option
                                                key={index}
                                                value={user.Username}
                                            >
                                                {formatUsername(user)}
                                            </option>
                                        ))}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Categoria
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>
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
                            <div className="flex flex-col gap-1 w-full">
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
                                        <option value="">...</option>
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
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col gap-1 w-full md:w-1/2">
                                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
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

                            <button
                                className="btn delete flex gap-2 items-center justify-center h-[40px] md:mt-6 w-full md:w-auto"
                                onClick={() => {
                                    setSelectedCategory("");
                                    setSelectedSubCategory("");
                                    setSelectedFrom("");
                                    setSelectedTo("");
                                    setSelectedStatus("");
                                    setSelectedSimulator("");
                                    setSelectedAssignees("");
                                    setSearchQuery("");
                                }}
                            >
                                <CloseIcon className="w-6" />
                                <p>Togli filtri</p>
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-[var(--bento-bg)] rounded-xl p-3 sm:p-4 w-full shadow-xl border border-[var(--light-primary)] mt-4 h-[calc(100%-4.5rem)] md:h-auto flex flex-col overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-start gap-4">
                        <div
                            className={`flex flex-col gap-1 ${showFilters ? "max-h-[32vh] sm:max-h-[35vh] md:max-h-[calc(80vh-22rem)]" : "max-h-[55vh] sm:max-h-[45vh] md:max-h-[calc(100vh-20rem)]"} overflow-y-auto pr-1 flex-1 w-full`}
                        >
                            <div className="sticky top-0 flex items-center justify-start gap-2 border-b border-[var(--light-primary)] pb-2 mb-4 bg-[var(--bento-bg)]">
                                <h1 className="text-md text-[var(--gray)]">
                                    Risultato
                                </h1>
                                <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                    {filteredTasks.length} task
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Caricamento...
                                </div>
                            ) : filteredTasks.length === 0 ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Nessuna task trovata
                                </div>
                            ) : (
                                filteredTasks.map((task) => (
                                    <Task
                                        key={task.id}
                                        title={task?.TITLE}
                                        date={formatDate(task?.DATE)}
                                        assignedTo={task?.ASSIGNED_TO}
                                        status={task?.STATUS}
                                        type="dashboard"
                                        wholeTask={task}
                                        onDeleteSuccess={handleDeleteSuccess}
                                        isLogbook={false}
                                    />
                                ))
                            )}
                        </div>

                        <div
                            className={`flex flex-col gap-1 ${showFilters ? "max-h-[32vh] sm:max-h-[35vh] md:max-h-[calc(80vh-22rem)]" : "max-h-[40vh] sm:max-h-[45vh] md:max-h-[calc(100vh-20rem)]"} overflow-y-auto pr-1 flex-1 w-full`}
                        >
                            <div className="sticky top-0 flex items-center justify-start gap-2 border-b border-[var(--light-primary)] pb-2 mb-4 bg-[var(--bento-bg)]">
                                <h1 className="text-md text-[var(--gray)]">
                                    Risultato
                                </h1>
                                <p className="text-xs bg-[var(--orange-light)] text-[var(--orange)] rounded-md px-2 py-1">
                                    {filteredLogbooks.length} entry
                                </p>
                            </div>

                            {logbooksLoading ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Caricamento...
                                </div>
                            ) : filteredLogbooks.length === 0 ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Nessuna entry trovata
                                </div>
                            ) : (
                                filteredLogbooks.map((logbook) => (
                                    <Task
                                        key={logbook.id}
                                        title={logbook?.TITLE}
                                        date={formatDate(logbook?.DATE)}
                                        assignedTo={logbook?.ASSIGNED_TO}
                                        status={logbook?.STATUS}
                                        type="dashboard&logbook"
                                        wholeTask={logbook}
                                        onDeleteSuccess={handleDeleteSuccess}
                                        isLogbook={true}
                                    />
                                ))
                            )}
                        </div>

                        <div
                            className={`flex flex-col gap-1 ${showFilters ? "max-h-[32vh] sm:max-h-[35vh] md:max-h-[calc(80vh-22rem)]" : "max-h-[40vh] sm:max-h-[45vh] md:max-h-[calc(100vh-20rem)]"} overflow-y-auto pr-1 flex-1 w-full`}
                        >
                            <div className="sticky top-0 flex items-center justify-start gap-2 border-b border-[var(--light-primary)] pb-2 mb-4 bg-[var(--bento-bg)]">
                                <h1 className="text-md text-[var(--gray)]">
                                    Risultato
                                </h1>
                                <p className="text-xs bg-[var(--weekend-cells)] text-[var(--weekend-text)] rounded-md px-2 py-1">
                                    {filteredPmTasks.length} PM Plan di{" "}
                                    {currentMonthName}
                                </p>
                            </div>

                            {pmLoading ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Caricamento...
                                </div>
                            ) : filteredPmTasks.length === 0 ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Nessun task PM Plan trovato
                                </div>
                            ) : (
                                filteredPmTasks.map((task) => (
                                    <Task
                                        key={task.ID}
                                        title={task.TITLE}
                                        date={formatDate(task.DATE)}
                                        assignedTo={task.ASSIGNED_TO}
                                        status={task.STATUS}
                                        type="dashboard"
                                        wholeTask={task}
                                        onDeleteSuccess={handleDeleteSuccess}
                                        isLogbook={false}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchModal;

import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import SearchIcon from "../assets/icons/search.tsx";
import FilterIcon from "../assets/icons/filter.tsx";
import TaskIcon from "../assets/icons/tasks.tsx";
import SimulatorIcon from "../assets/icons/simulator.tsx";
import BackIcon from "../assets/icons/back.tsx";
import { GetTodayDate } from "../functions/CurrentTime.jsx";
import CreateModal from "../components/modals/CreateModal.jsx";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useSimulators } from "../components/data/provider/simulatorAPI/useSimulators";
import { exportTasksToPDF } from "../functions/ExportPDF.jsx";
import ArrowRightIcon from "../assets/icons/arrow-right.tsx";
import { GetSimulatorsList } from "../functions/Simulators.jsx";
import CloseIcon from "../assets/icons/close.tsx";

function Tasks() {
    const { tasks, loading, fetchTasks } = useTasks();
    const { simulators: todaySimulators } = useSimulators();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    const [selectedAssignees, setSelectedAssignees] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const { currentUserRole, users } = useUsers();
    const [showFilters, setShowFilters] = useState(false);
    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState("");
    const [selectedFrom, setSelectedFrom] = useState("");
    const [selectedTo, setSelectedTo] = useState("");
    const [dateError, setDateError] = useState(false);
    const [viewDays, setViewDays] = useState(1);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        if (selectedFrom && selectedTo) {
            setDateError(new Date(selectedFrom) > new Date(selectedTo));
        } else {
            setDateError(false);
        }
    }, [selectedFrom, selectedTo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(event.target)
            ) {
                setShowExportMenu(false);
            }
        };

        if (showExportMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportMenu]);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowCalendar(false);
        const newDate = new Date(startDate);
        newDate.setDate(day);
        setStartDate(newDate);
    };

    const handleBackToCalendar = () => {
        setShowCalendar(true);
        setSelectedDay(null);
    };

    const handleTaskClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
        }
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Hai creato la task con successo"
                    : "Errore durante la creazione della task"),
        );
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    const handleSimulatorClick = () => {
        setIsSimulatorModalOpen(true);
    };

    const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
    };

    const handleExportPDF = (timeFilter = null) => {
        try {
            // Pass null as date if filters are active, otherwise pass startDate
            const hasActiveFilters =
                selectedFrom ||
                selectedTo ||
                selectedCategory ||
                selectedSubCategory ||
                selectedStatus ||
                selectedSimulator ||
                selectedAssignees ||
                searchQuery.trim();

            // Filter tasks and simulators by selected date if no filters are active
            let tasksToExport = filteredTasks;
            let simulatorsToExport = [];

            if (!hasActiveFilters) {
                // Filter tasks by the selected date
                const selectedDate = new Date(startDate);
                selectedDate.setHours(0, 0, 0, 0);

                tasksToExport = filteredTasks.filter((task) => {
                    if (!task.DATE) return false;
                    const taskDate = new Date(task.DATE);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === selectedDate.getTime();
                });

                // Filter simulators by the selected date
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0",
                );
                const day = String(selectedDate.getDate()).padStart(2, "0");
                const formattedDate = `${year}-${month}-${day}`;

                simulatorsToExport = (todaySimulators || []).filter((sim) => {
                    if (!sim.CREATION_DATE) return false;
                    const simDate = new Date(sim.CREATION_DATE);
                    const simYear = simDate.getFullYear();
                    const simMonth = String(simDate.getMonth() + 1).padStart(
                        2,
                        "0",
                    );
                    const simDay = String(simDate.getDate()).padStart(2, "0");
                    const simFormattedDate = `${simYear}-${simMonth}-${simDay}`;
                    return simFormattedDate === formattedDate;
                });
            }

            // Filter by time if timeFilter is provided
            if (timeFilter) {
                tasksToExport = tasksToExport.filter(
                    (task) => task.TIME === timeFilter,
                );
            }

            const tasksExported = exportTasksToPDF(
                tasksToExport,
                hasActiveFilters ? null : startDate,
                simulatorsToExport,
                "Night Activities",
            );
            setPopupType("success");
            setPopupMessage(
                `PDF esportato con successo! (${tasksExported} task${
                    tasksExported !== 1 ? "s" : ""
                })`,
            );
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
            setShowExportMenu(false);
        } catch (error) {
            console.error("Errore durante l'esportazione del PDF:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'esportazione del PDF");
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
            setShowExportMenu(false);
        }
    };

    const showFiltersFunction = () => {
        setShowFilters(!showFilters);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (selectedSimulator) {
            result = result.filter(
                (task) => task.SIMULATOR === selectedSimulator,
            );
        }

        if (selectedAssignees) {
            result = result.filter(
                (task) => task.ASSIGNED_TO === selectedAssignees,
            );
        }

        if (selectedStatus) {
            result = result.filter((task) => task.STATUS === selectedStatus);
        }

        if (selectedCategory) {
            result = result.filter(
                (task) => task.CATEGORY === selectedCategory,
            );
        }

        if (selectedSubCategory) {
            result = result.filter(
                (task) => task.SUBCATEGORY === selectedSubCategory,
            );
        }

        if (selectedFrom) {
            result = result.filter((task) => {
                const taskDate = new Date(task.DATE);
                taskDate.setHours(0, 0, 0, 0);
                const fromDate = new Date(selectedFrom);
                fromDate.setHours(0, 0, 0, 0);
                return taskDate >= fromDate;
            });
        }

        if (selectedTo) {
            result = result.filter((task) => {
                const taskDate = new Date(task.DATE);
                taskDate.setHours(0, 0, 0, 0);
                const toDate = new Date(selectedTo);
                toDate.setHours(23, 59, 59, 999);
                return taskDate <= toDate;
            });
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (task) =>
                    task.TITLE?.toLowerCase().includes(query) ||
                    task.DESCRIPTION?.toLowerCase().includes(query) ||
                    task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                    task.STATUS?.toLowerCase().includes(query),
            );
        }

        return result;
    }, [
        tasks,
        searchQuery,
        selectedSimulator,
        selectedAssignees,
        selectedStatus,
        selectedCategory,
        selectedSubCategory,
        selectedFrom,
        selectedTo,
    ]);

    const datesList = useMemo(() => {
        return Array.from({ length: viewDays }).map((_, index) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + index);
            return currentDate;
        });
    }, [startDate, viewDays]);

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

    const getSelectedDateString = (currentDate) => {
        return (
            currentDate
                .toLocaleDateString("it-IT", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
                .charAt(0)
                .toUpperCase() +
            currentDate
                .toLocaleDateString("it-IT", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
                .slice(1)
        );
    };

    return (
        <section className="flex h-screen">
            <Sidebar active="tasks" isSidebarOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                />

                <div className="flex-1 overflow-y-auto">
                    {showCalendar ? (
                        <Calendar
                            startDate={startDate}
                            setStartDate={setStartDate}
                            onDayClick={handleDayClick}
                            type="tasks"
                        />
                    ) : (
                        <>
                            <div className="m-8 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="btn flex gap-2 items-center"
                                        onClick={handleBackToCalendar}
                                    >
                                        <BackIcon className="w-6" />
                                        <p>Torna al Calendario</p>
                                    </button>

                                    <DatePickerComponent
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        isCalendar={false}
                                    />
                                </div>

                                <div className="relative" ref={exportMenuRef}>
                                    <button
                                        className="btn secondary"
                                        onClick={() =>
                                            setShowExportMenu(!showExportMenu)
                                        }
                                    >
                                        Export PDF
                                    </button>
                                    {showExportMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-t-lg border-b border-[var(--light-primary)]"
                                                onClick={() =>
                                                    handleExportPDF("Diurno")
                                                }
                                            >
                                                Giorno
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-b-lg"
                                                onClick={() =>
                                                    handleExportPDF("Notturno")
                                                }
                                            >
                                                Notte
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                                        Tabella task
                                    </p>

                                    <div className="flex items-center w-full justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex items-center bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-md p-2 cursor-pointer transition-all duration-200"
                                                onClick={showFiltersFunction}
                                            >
                                                <FilterIcon className="w-6 text-[var(--black)] icon cursor-pointer" />
                                            </div>
                                            <div className="relative w-[20vw]">
                                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                                                <input
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    type="search"
                                                    placeholder="Cerca task"
                                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                                                />
                                            </div>

                                            {(currentUserRole === "Admin" ||
                                                currentUserRole ===
                                                    "Shift Leader") && (
                                                <>
                                                    <button
                                                        className="btn flex gap-2 items-center"
                                                        onClick={
                                                            handleTaskClick
                                                        }
                                                    >
                                                        <TaskIcon className="w-6" />
                                                        <p>Aggiungi task</p>
                                                    </button>
                                                </>
                                            )}

                                            {GetTodayDate(startDate) ===
                                                GetTodayDate(new Date()) && (
                                                <button
                                                    className="btn secondary flex gap-2 items-center"
                                                    onClick={() =>
                                                        handleSimulatorClick(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <SimulatorIcon className="w-6" />
                                                    <p>Imposta simulatore</p>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                                            <div
                                                className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer ${viewDays === 1 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                                onClick={() => setViewDays(1)}
                                            >
                                                <p className="text-sm">Oggi</p>
                                            </div>

                                            <div
                                                className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer ${viewDays === 7 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                                onClick={() => setViewDays(7)}
                                            >
                                                <p className="text-sm">
                                                    1 settimana
                                                </p>
                                            </div>

                                            <div
                                                className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer ${viewDays === 14 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                                onClick={() => setViewDays(14)}
                                            >
                                                <p className="text-sm">
                                                    2 settimane
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {showFilters && (
                                        <div className="flex flex-row gap-4">
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
                                                            setSelectedStatus(
                                                                e.target.value,
                                                            );
                                                        }}
                                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                                    >
                                                        <option value="">
                                                            ...
                                                        </option>
                                                        <option value="Non iniziato">
                                                            Non iniziato
                                                        </option>
                                                        <option value="In corso">
                                                            In corso
                                                        </option>
                                                        <option value="Completato">
                                                            Completato
                                                        </option>
                                                        <option value="Non completato">
                                                            Non completato
                                                        </option>
                                                        <option value="Da definire">
                                                            Da definire
                                                        </option>
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
                                                        value={
                                                            selectedSimulator
                                                        }
                                                        onChange={(e) => {
                                                            setSelectedSimulator(
                                                                e.target.value,
                                                            );
                                                        }}
                                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                                    >
                                                        <option value="">
                                                            ...
                                                        </option>
                                                        {simulators.map(
                                                            (
                                                                simulator,
                                                                index,
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        simulator
                                                                    }
                                                                >
                                                                    {simulator}
                                                                </option>
                                                            ),
                                                        )}
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
                                                        value={
                                                            selectedAssignees
                                                        }
                                                        onChange={(e) => {
                                                            setSelectedAssignees(
                                                                e.target.value,
                                                            );
                                                        }}
                                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                                    >
                                                        <option value="">
                                                            ...
                                                        </option>
                                                        {users.map(
                                                            (user, index) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        user.Username
                                                                    }
                                                                >
                                                                    {user.Username.split(
                                                                        ".",
                                                                    )[0]
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        user.Username.split(
                                                                            ".",
                                                                        )[0].slice(
                                                                            1,
                                                                        )}
                                                                    {user.Username.split(
                                                                        ".",
                                                                    )[1] && (
                                                                        <>
                                                                            {" "}
                                                                            {user.Username.split(
                                                                                ".",
                                                                            )[1]
                                                                                .charAt(
                                                                                    0,
                                                                                )
                                                                                .toUpperCase() +
                                                                                user.Username.split(
                                                                                    ".",
                                                                                )[1].slice(
                                                                                    1,
                                                                                )}
                                                                        </>
                                                                    )}
                                                                </option>
                                                            ),
                                                        )}
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
                                                            setSelectedCategory(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                                    >
                                                        <option value="">
                                                            ...
                                                        </option>
                                                        {Object.keys(
                                                            categories,
                                                        ).map(
                                                            (
                                                                category,
                                                                index,
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        category
                                                                    }
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
                                                        value={
                                                            selectedSubCategory
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedSubCategory(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                                    >
                                                        {categories[
                                                            selectedCategory
                                                        ]?.map(
                                                            (
                                                                subCategory,
                                                                index,
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        subCategory
                                                                    }
                                                                >
                                                                    {
                                                                        subCategory
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {showFilters && (
                                        <div className="flex flex-row gap-4">
                                            <div className="flex flex-col gap-1 w-1/2">
                                                <div className="flex flex-row justify-between gap-4">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <h3 className="text-sm text-[var(--gray)]">
                                                            Da
                                                        </h3>
                                                        <input
                                                            type="date"
                                                            value={selectedFrom}
                                                            onChange={(e) =>
                                                                setSelectedFrom(
                                                                    e.target
                                                                        .value,
                                                                )
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
                                                                setSelectedTo(
                                                                    e.target
                                                                        .value,
                                                                )
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
                                                        La data di inizio deve
                                                        essere precedente alla
                                                        data di fine
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                className="btn delete flex gap-2 items-center h-[40px] mt-6"
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
                                    )}

                                    {datesList.map((currentDate, index) => (
                                        <div key={currentDate.toISOString()}>
                                            {viewDays > 1 && (
                                                <h1 className="text-xl font-semibold text-[var(--black)] mb-1 mt-4">
                                                    {getSelectedDateString(
                                                        currentDate,
                                                    )}
                                                </h1>
                                            )}
                                            <div
                                                className={
                                                    viewDays > 1 &&
                                                    "p-4 bg-[var(--white)] rounded-xl"
                                                }
                                            >
                                                <Table
                                                    type="tasks"
                                                    loading={loading}
                                                    taskList={filteredTasks}
                                                    date={
                                                        selectedFrom ||
                                                        selectedTo
                                                            ? null
                                                            : currentDate
                                                    }
                                                    onDeleteSuccess={
                                                        handleSuccess
                                                    }
                                                />
                                            </div>

                                            {viewDays > 1 &&
                                                index < viewDays - 1 && (
                                                    <div className="my-4" />
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateModal
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                    type="task"
                    initialDate={startDate.toISOString().split("T")[0]}
                />
            )}
            {isSimulatorModalOpen && (
                <SimulatorModal onClose={handleCloseSimulatorModal} />
            )}
            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Tasks;

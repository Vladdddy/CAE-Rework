import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import MobileCalendar from "../components/layout/MobileCalendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import LogbookIcon from "../assets/icons/logbook.tsx";
import BackIcon from "../assets/icons/back.tsx";
import CreateModal from "../components/modals/CreateModal.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useUnavailableTasks } from "../components/data/provider/unavailableTaskAPI/useUnavailableTasks";
import { useTaskSimOne } from "../components/data/provider/taskSimOneAPI/useTaskSimOne";
import { useUnavailableLogbooks } from "../components/data/provider/unavailableLogbookAPI/useUnavailableLogbooks";
import { useLogbooks } from "../components/data/provider/logbookAPI/useLogbooks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useSimulators } from "../components/data/provider/simulatorAPI/useSimulators";
import { useTrainingLoads } from "../components/data/provider/trainingLoadAPI/useTrainingLoads";
import { exportTasksToPDF } from "../functions/ExportPDF.jsx";

const SIMULATOR_MAP = {
    1: "109FFS",
    2: "FTD",
    3: "139#1",
    4: "139#3",
    5: "169",
    6: "189",
    13: "109FFS",
};

function Logbook() {
    const { tasks, loading, fetchTasks } = useTasks();
    const {
        tasks: unavailableTasks,
        loading: unavailableLoading,
        fetchTasks: fetchUnavailableTasks,
    } = useUnavailableTasks();
    const { taskSimOne } = useTaskSimOne();
    const {
        logbooks: unavailableLogbooks,
        loading: unavailableLogbooksLoading,
        fetchLogbooks: fetchUnavailableLogbooks,
    } = useUnavailableLogbooks();
    const { logbooks, fetchLogbooks } = useLogbooks();
    const { simulators: todaySimulators } = useSimulators();
    const { trainingLoads } = useTrainingLoads();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);
    const { users } = useUsers();
    const [viewDays, setViewDays] = useState(1);
    const [showExportReportMenu, setShowExportReportMenu] = useState(false);
    const [showExportActivityMenu, setShowExportActivityMenu] = useState(false);
    const exportReportMenuRef = useRef(null);
    const exportActivityMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                exportReportMenuRef.current &&
                !exportReportMenuRef.current.contains(event.target)
            ) {
                setShowExportReportMenu(false);
            }
            if (
                exportActivityMenuRef.current &&
                !exportActivityMenuRef.current.contains(event.target)
            ) {
                setShowExportActivityMenu(false);
            }
        };

        if (showExportReportMenu || showExportActivityMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportReportMenu, showExportActivityMenu]);

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
            await fetchUnavailableTasks();
            await fetchLogbooks();
            await fetchUnavailableLogbooks();
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

    const handleExportPDF = async (
        timeFilter = null,
        exportType = "report",
    ) => {
        try {
            const normalizedUnavailableTasks = (unavailableTasks || []).map(
                (task) => ({
                    ...task,
                    IS_UNAVAILABLE: true,
                }),
            );

            const normalizedPmTasks = (taskSimOne || [])
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
                        SIMULATOR: SIMULATOR_MAP[simulatorId],
                        DATE: task["Scheduled on"] ?? task.DATE,
                        TIME: "Notturno",
                        TITLE: task["Task"] || "PM Task",
                        ASSIGNED_TO:
                            task["Task Performed By"] || task["Tech id"] || "",
                        STATUS: isDone ? "Completato" : "Non completato",
                        IS_PM_PLAN_TASK: true,
                    };
                });

            const allTasksForExport = [
                ...(tasks || []),
                ...normalizedUnavailableTasks,
                ...normalizedPmTasks,
            ];

            const hasActiveFilters = false;

            const normalizedUnavailableLogbooks = (
                unavailableLogbooks || []
            ).map((logbook) => ({
                ...logbook,
                IS_UNAVAILABLE: true,
            }));

            const allLogbooksForExport = [
                ...(logbooks || []),
                ...normalizedUnavailableLogbooks,
            ];

            let itemsToExport;
            let simulatorsToExport;

            if (hasActiveFilters) {
                itemsToExport = [...allTasksForExport, ...allLogbooksForExport];
                simulatorsToExport = [];
            } else {
                const selectedDate = new Date(startDate);
                selectedDate.setHours(0, 0, 0, 0);

                const tasksForDate = allTasksForExport.filter((task) => {
                    const taskDate = new Date(task.DATE);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === selectedDate.getTime();
                });

                const logbooksForDate = allLogbooksForExport.filter(
                    (logbook) => {
                        const logbookDate = new Date(logbook.DATE);
                        logbookDate.setHours(0, 0, 0, 0);
                        return logbookDate.getTime() === selectedDate.getTime();
                    },
                );

                itemsToExport = [...tasksForDate, ...logbooksForDate];

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

            if (timeFilter) {
                itemsToExport = itemsToExport.filter(
                    (item) => item.TIME === timeFilter,
                );
            }

            if (exportType === "activities" || exportType === "activity") {
                itemsToExport = itemsToExport.filter((item) => !item.ISLOGBOOK);
            }

            const statusPriority = {
                Completato: 1,
                "In corso": 2,
                "Non completato": 3,
            };

            itemsToExport.sort((a, b) => {
                const priorityA = statusPriority[a.STATUS] || 999;
                const priorityB = statusPriority[b.STATUS] || 999;
                return priorityA - priorityB;
            });

            const API_URL = import.meta.env.VITE_API_URL;
            const notesMap = {};

            await Promise.all(
                itemsToExport.map(async (item) => {
                    try {
                        const isUnavailableTask =
                            item?.TYPE === "Unavailable" ||
                            item?.IS_UNAVAILABLE === true;
                        const notesEntityId =
                            !item.ISLOGBOOK && isUnavailableTask
                                ? item?.ORIGINAL_TASK_ID || item.ID
                                : item.ID;

                        const endpoint = item.ISLOGBOOK
                            ? `${API_URL}/notesLogbook/${item.ID}`
                            : `${API_URL}/notes/${notesEntityId}`;
                        const response = await fetch(endpoint);
                        if (response.ok) {
                            const notes = await response.json();
                            notesMap[notesEntityId] = notes;
                        }
                    } catch (error) {
                        console.error(
                            `Failed to fetch notes for item ${item.ID}:`,
                            error,
                        );
                    }
                }),
            );

            let pdfTitle;
            if (exportType === "activity" || exportType === "activities") {
                pdfTitle =
                    timeFilter === "Diurno"
                        ? "Day Activities"
                        : "Night Activities";
            } else {
                pdfTitle =
                    timeFilter === "Diurno" ? "Day Report" : "Night Report";
            }

            const itemsExported = exportTasksToPDF(
                itemsToExport,
                hasActiveFilters ? null : startDate,
                simulatorsToExport,
                trainingLoads,
                pdfTitle,
                notesMap,
                users,
                exportType !== "activity" && exportType !== "activities",
            );
            setPopupType("success");
            setPopupMessage(
                `PDF esportato con successo! (${itemsExported} item${
                    itemsExported !== 1 ? "s" : ""
                })`,
            );
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            setShowExportReportMenu(false);
            setShowExportActivityMenu(false);
        } catch (error) {
            console.error("Errore durante l'esportazione del PDF:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'esportazione del PDF");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            setShowExportReportMenu(false);
            setShowExportActivityMenu(false);
        }
    };

    const datesList = useMemo(() => {
        return Array.from({ length: viewDays }).map((_, index) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + index);
            return currentDate;
        });
    }, [startDate, viewDays]);

    const pmPlanTasks = useMemo(() => {
        return (taskSimOne || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                return simulatorId && SIMULATOR_MAP[simulatorId];
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] ?? task.TITLE,
                    DATE: task["Scheduled on"] ?? task.DATE,
                    STATUS:
                        task["Task Done"] === true
                            ? "Completato"
                            : "Non completato",
                    ASSIGNED_TO: task["Task Performed By"] ?? task.ASSIGNED_TO,
                    DESCRIPTION:
                        task["Reference Doc"] ??
                        task["Maintenance Manual Reference"] ??
                        task.DESCRIPTION,
                    TYPE: "PM Plan",
                    IS_PM_PLAN_TASK: true,
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: "Notturno",
                    Data: task["Scheduled on"] ?? task.Data,
                };
            });
    }, [taskSimOne]);

    const mergedTasks = useMemo(() => {
        const normalizedUnavailableTasks = (unavailableTasks || []).map(
            (task) => ({ ...task, IS_UNAVAILABLE: true }),
        );
        return [
            ...(tasks || []),
            ...normalizedUnavailableTasks,
            ...pmPlanTasks,
        ];
    }, [tasks, unavailableTasks, pmPlanTasks]);

    const mergedLogbooks = useMemo(() => {
        const normalizedUnavailableLogbooks = (unavailableLogbooks || []).map(
            (logbook) => ({ ...logbook, IS_UNAVAILABLE: true }),
        );
        return [...(logbooks || []), ...normalizedUnavailableLogbooks];
    }, [logbooks, unavailableLogbooks]);

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

    // Reusable export dropdown component
    const ExportDropdown = ({
        label,
        menuRef,
        isOpen,
        setIsOpen,
        onDiurno,
        onNotturno,
    }) => (
        <div className="relative w-full sm:w-auto" ref={menuRef}>
            <button
                className="btn secondary w-full sm:w-auto justify-center flex items-center gap-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                    <button
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-t-lg border-b border-[var(--light-primary)]"
                        onClick={onDiurno}
                    >
                        Giorno
                    </button>
                    <button
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-b-lg"
                        onClick={onNotturno}
                    >
                        Notte
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <section className="flex h-screen">
            <Sidebar
                active="logbook"
                isSidebarOpen={isSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                <div className="flex-1 overflow-y-auto">
                    {showCalendar ? (
                        <>
                            <div className="hidden md:block">
                                <Calendar
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    onDayClick={handleDayClick}
                                    type="logbooks"
                                />
                            </div>

                            <div className="md:hidden">
                                <MobileCalendar
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    onDayClick={handleDayClick}
                                    type="logbooks"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ── Top navigation bar ── */}
                            <div className="mx-3 mt-4 mb-2 md:m-8 md:mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* Left: back + date picker */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        className="btn flex gap-2 items-center w-full sm:w-auto justify-center"
                                        onClick={handleBackToCalendar}
                                    >
                                        <BackIcon className="w-5 md:w-6" />
                                        <p className="text-sm md:text-base">
                                            Torna al Calendario
                                        </p>
                                    </button>

                                    <div className="flex justify-center items-center w-full sm:w-auto">
                                        <DatePickerComponent
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            isCalendar={false}
                                        />
                                    </div>
                                </div>

                                {/* Right: export buttons */}
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    <ExportDropdown
                                        label="Export Report"
                                        menuRef={exportReportMenuRef}
                                        isOpen={showExportReportMenu}
                                        setIsOpen={setShowExportReportMenu}
                                        onDiurno={() =>
                                            handleExportPDF("Diurno", "report")
                                        }
                                        onNotturno={() =>
                                            handleExportPDF(
                                                "Notturno",
                                                "report",
                                            )
                                        }
                                    />
                                    <ExportDropdown
                                        label="Export Activity"
                                        menuRef={exportActivityMenuRef}
                                        isOpen={showExportActivityMenu}
                                        setIsOpen={setShowExportActivityMenu}
                                        onDiurno={() =>
                                            handleExportPDF(
                                                "Diurno",
                                                "activities",
                                            )
                                        }
                                        onNotturno={() =>
                                            handleExportPDF(
                                                "Notturno",
                                                "activities",
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* ── Main content card ── */}
                            <div className="mx-3 my-3 md:m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-3 md:gap-4 border border-[var(--light-primary)] rounded-lg p-3 md:p-4 bg-[var(--bento-bg)]">
                                    {/* Card title */}
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-3 md:pb-4">
                                        Tabella logbook
                                    </p>

                                    {/* Action bar: add button + view toggle */}
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                                        {/* Left: add entry button */}
                                        <button
                                            className="btn tertiary flex gap-2 items-center text-sm w-full md:w-fit justify-center"
                                            onClick={handleTaskClick}
                                        >
                                            <LogbookIcon className="w-5 shrink-0" />
                                            <p>Aggiungi entry</p>
                                        </button>

                                        {/* Right: view toggle */}
                                        <div className="overflow-x-auto pb-0.5">
                                            <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-full p-1 min-w-max">
                                                {[
                                                    { label: "Oggi", days: 1 },
                                                    {
                                                        label: "1 settimana",
                                                        days: 7,
                                                    },
                                                    {
                                                        label: "2 settimane",
                                                        days: 14,
                                                    },
                                                ].map(({ label, days }) => (
                                                    <div
                                                        key={days}
                                                        className={`flex items-center gap-2 p-2 px-3 md:px-4 rounded-md cursor-pointer whitespace-nowrap flex-1 justify-center ${
                                                            viewDays === days
                                                                ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                                                : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                                                        } transition-all duration-200`}
                                                        onClick={() =>
                                                            setViewDays(days)
                                                        }
                                                    >
                                                        <p className="text-sm">
                                                            {label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date sections */}
                                    {datesList.map((currentDate, index) => (
                                        <div key={currentDate.toISOString()}>
                                            {viewDays > 1 && (
                                                <h1 className="text-base md:text-xl font-semibold text-[var(--black)] mb-1 mt-4">
                                                    {getSelectedDateString(
                                                        currentDate,
                                                    )}
                                                </h1>
                                            )}
                                            <div
                                                className={
                                                    viewDays > 1
                                                        ? "p-3 md:p-4 bg-[var(--pure-white)] rounded-xl"
                                                        : ""
                                                }
                                            >
                                                <Table
                                                    type="tasks&logbook"
                                                    loading={
                                                        loading ||
                                                        unavailableLoading ||
                                                        unavailableLogbooksLoading
                                                    }
                                                    taskList={mergedTasks}
                                                    logbookList={mergedLogbooks}
                                                    date={currentDate}
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
                    type="logbook"
                />
            )}

            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Logbook;

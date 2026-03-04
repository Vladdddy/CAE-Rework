import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import LogbookIcon from "../assets/icons/logbook.tsx";
import BackIcon from "../assets/icons/back.tsx";
import CreateModal from "../components/modals/CreateModal.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useLogbooks } from "../components/data/provider/logbookAPI/useLogbooks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useSimulators } from "../components/data/provider/simulatorAPI/useSimulators";
import { exportTasksToPDF } from "../functions/ExportPDF.jsx";

function Logbook() {
    const { tasks, loading, fetchTasks } = useTasks();
    const { logbooks, fetchLogbooks } = useLogbooks();
    const { simulators: todaySimulators } = useSimulators();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
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
            await fetchLogbooks();
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
            // Pass null as date if filters are active, otherwise pass startDate
            const hasActiveFilters = false;

            let itemsToExport;
            let simulatorsToExport;

            if (hasActiveFilters) {
                // If filters are active, use the filtered results
                itemsToExport = [...tasks, ...logbooks];
                simulatorsToExport = [];
            } else {
                // If no filters are active, filter by the selected date only
                const selectedDate = new Date(startDate);
                selectedDate.setHours(0, 0, 0, 0);

                // Filter tasks by selected date
                const tasksForDate = tasks.filter((task) => {
                    const taskDate = new Date(task.DATE);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === selectedDate.getTime();
                });

                // Filter logbooks by selected date
                const logbooksForDate = logbooks.filter((logbook) => {
                    const logbookDate = new Date(logbook.DATE);
                    logbookDate.setHours(0, 0, 0, 0);
                    return logbookDate.getTime() === selectedDate.getTime();
                });

                itemsToExport = [...tasksForDate, ...logbooksForDate];

                // Filter simulators by selected date
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
                itemsToExport = itemsToExport.filter(
                    (item) => item.TIME === timeFilter,
                );
            }

            // Fetch notes for all items (tasks and logbooks)
            const API_URL = import.meta.env.VITE_API_URL;
            const notesMap = {};

            await Promise.all(
                itemsToExport.map(async (item) => {
                    try {
                        const endpoint = item.ISLOGBOOK
                            ? `${API_URL}/notesLogbook/${item.ID}`
                            : `${API_URL}/notes/${item.ID}`;
                        const response = await fetch(endpoint);
                        if (response.ok) {
                            const notes = await response.json();
                            notesMap[item.ID] = notes;
                        }
                    } catch (error) {
                        console.error(
                            `Failed to fetch notes for item ${item.ID}:`,
                            error,
                        );
                    }
                }),
            );

            // Determine the title based on timeFilter and exportType
            let pdfTitle;
            if (exportType === "activity") {
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
                pdfTitle,
                notesMap,
                users,
            );
            setPopupType("success");
            setPopupMessage(
                `PDF esportato con successo! (${itemsExported} item${
                    itemsExported !== 1 ? "s" : ""
                })`,
            );
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
            setShowExportReportMenu(false);
            setShowExportActivityMenu(false);
        } catch (error) {
            console.error("Errore durante l'esportazione del PDF:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'esportazione del PDF");
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
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
            <Sidebar active="logbook" isSidebarOpen={isSidebarOpen} />

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
                            type="logbooks"
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

                                <div className="flex items-center gap-2">
                                    <div
                                        className="relative"
                                        ref={exportReportMenuRef}
                                    >
                                        <button
                                            className="btn secondary"
                                            onClick={() =>
                                                setShowExportReportMenu(
                                                    !showExportReportMenu,
                                                )
                                            }
                                        >
                                            Export Report
                                        </button>
                                        {showExportReportMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                                                <button
                                                    className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-t-lg border-b border-[var(--light-primary)]"
                                                    onClick={() =>
                                                        handleExportPDF(
                                                            "Diurno",
                                                            "report",
                                                        )
                                                    }
                                                >
                                                    Giorno
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-b-lg"
                                                    onClick={() =>
                                                        handleExportPDF(
                                                            "Notturno",
                                                            "report",
                                                        )
                                                    }
                                                >
                                                    Notte
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="relative"
                                        ref={exportActivityMenuRef}
                                    >
                                        <button
                                            className="btn secondary"
                                            onClick={() =>
                                                setShowExportActivityMenu(
                                                    !showExportActivityMenu,
                                                )
                                            }
                                        >
                                            Export Activity
                                        </button>
                                        {showExportActivityMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                                                <button
                                                    className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-t-lg border-b border-[var(--light-primary)]"
                                                    onClick={() =>
                                                        handleExportPDF(
                                                            "Diurno",
                                                            "activities",
                                                        )
                                                    }
                                                >
                                                    Giorno
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-b-lg"
                                                    onClick={() =>
                                                        handleExportPDF(
                                                            "Notturno",
                                                            "activities",
                                                        )
                                                    }
                                                >
                                                    Notte
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                                        Tabella logbook
                                    </p>

                                    <div className="flex items-center w-full justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                className="btn flex gap-2 items-center"
                                                onClick={handleTaskClick}
                                            >
                                                <LogbookIcon className="w-6" />
                                                <p>Aggiungi entry</p>
                                            </button>
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
                                                    type="tasks&logbook"
                                                    loading={loading}
                                                    taskList={tasks}
                                                    logbookList={logbooks}
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

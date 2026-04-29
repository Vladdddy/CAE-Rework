import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import MobileCalendar from "../components/layout/MobileCalendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import TaskIcon from "../assets/icons/tasks.tsx";
import SimulatorIcon from "../assets/icons/simulator.tsx";
import BackIcon from "../assets/icons/back.tsx";
import { GetTodayDate } from "../functions/CurrentTime.jsx";
import CreateModal from "../components/modals/CreateModal.jsx";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useUnavailableTasks } from "../components/data/provider/unavailableTaskAPI/useUnavailableTasks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useTaskSimOne } from "../components/data/provider/taskSimOneAPI/useTaskSimOne";
import { getPmPlanTime } from "../functions/GetPmPlanTime.jsx";

const SIMULATOR_MAP = {
    1: "109FFS",
    2: "FTD",
    3: "139#1",
    4: "139#3",
    5: "169",
    6: "189",
    13: "109FFS",
};

function Tasks() {
    const { tasks, loading, fetchTasks } = useTasks();
    const {
        tasks: unavailableTasks,
        loading: unavailableLoading,
        fetchTasks: fetchUnavailableTasks,
    } = useUnavailableTasks();
    const { taskSimOne, unfinishedPmTasks, unfinishedPmLoading, fetchUnfinishedPmTasks } = useTaskSimOne();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);
    const { currentUserRole, users } = useUsers();
    const [viewDays, setViewDays] = useState(1);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

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
            await fetchUnavailableTasks();
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

    const datesList = useMemo(() => {
        return Array.from({ length: viewDays }).map((_, index) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + index);
            return currentDate;
        });
    }, [startDate, viewDays]);

    const pmPlanTasks = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayDateStr = `${y}-${m}-${d}`;

        return (taskSimOne || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                if (!simulatorId || !SIMULATOR_MAP[simulatorId]) return false;
                // Exclude past unfinished tasks — they are handled by normalizedUnfinishedPmTasks
                const isDone = task["Task Done"] === true;
                const scheduledOn = task["Scheduled on"] ?? task.DATE;
                const scheduledDateStr = scheduledOn
                    ? String(scheduledOn).split("T")[0]
                    : null;
                const isOverdue =
                    !isDone && scheduledDateStr && scheduledDateStr < todayDateStr;
                return !isOverdue;
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                const isDone = task["Task Done"] === true;
                const scheduledOn = task["Scheduled on"] ?? task.DATE;
                const assignedToId = task["AssignedTo"];
                const assignedUser =
                    assignedToId != null
                        ? users.find((u) => u.ID === assignedToId)
                        : null;
                const displayAssignee = isDone
                    ? (task["Task Performed By"] ?? null)
                    : (assignedUser?.Username ?? null);
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] ?? task.TITLE,
                    DATE: scheduledOn,
                    STATUS: isDone ? "Completato" : "Non completato",
                    ASSIGNED_TO: displayAssignee,
                    DESCRIPTION:
                        task["Reference Doc"] ??
                        task["Maintenance Manual Reference"] ??
                        task.DESCRIPTION,
                    TYPE: "PM Plan",
                    IS_PM_PLAN_TASK: true,
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: getPmPlanTime(task),
                    Data: scheduledOn ?? task.Data,
                };
            });
    }, [taskSimOne, users]);

    useEffect(() => {
        fetchUnfinishedPmTasks();
    }, [fetchUnfinishedPmTasks]);

    const normalizedUnfinishedPmTasks = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayIso = `${y}-${m}-${d}T00:00:00.000Z`;

        return (unfinishedPmTasks || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                return simulatorId && SIMULATOR_MAP[simulatorId];
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                const assignedToId = task["AssignedTo"];
                const assignedUser =
                    assignedToId != null
                        ? users.find((u) => u.ID === assignedToId)
                        : null;
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] ?? task.TITLE,
                    DATE: todayIso,
                    STATUS: "Non completato",
                    ASSIGNED_TO: assignedUser?.Username ?? null,
                    DESCRIPTION:
                        task["Reference Doc"] ??
                        task["Maintenance Manual Reference"] ??
                        task.DESCRIPTION,
                    TYPE: "PM Plan",
                    IS_PM_PLAN_TASK: true,
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: getPmPlanTime(task),
                    Data: todayIso,
                };
            });
    }, [unfinishedPmTasks, users]);

    const mergedTasks = useMemo(() => {
        const normalizedUnavailableTasks = (unavailableTasks || []).map(
            (task) => ({
                ...task,
                IS_UNAVAILABLE: true,
            }),
        );

        return [
            ...(tasks || []),
            ...normalizedUnavailableTasks,
            ...pmPlanTasks,
            ...normalizedUnfinishedPmTasks,
        ];
    }, [tasks, unavailableTasks, pmPlanTasks, normalizedUnfinishedPmTasks]);

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
            <Sidebar
                active="tasks"
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
                                    type="tasks"
                                />
                            </div>

                            <div className="md:hidden">
                                <MobileCalendar
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    onDayClick={handleDayClick}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ── Top navigation bar ── */}
                            <div className="mx-3 mt-4 mb-2 md:m-8 md:mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <button
                                        className="btn flex gap-2 items-center w-full md:w-auto justify-center"
                                        onClick={handleBackToCalendar}
                                    >
                                        <BackIcon className="w-6" />
                                        <p className="text-sm md:text-base">
                                            Torna al Calendario
                                        </p>
                                    </button>

                                    <div className="flex justify-center items-center gap-2 w-full md:w-auto mt-2 sm:mt-0">
                                        <DatePickerComponent
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            isCalendar={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Main content card ── */}
                            <div className="mx-3 my-3 md:m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-3 md:gap-4 border border-[var(--light-primary)] rounded-lg p-3 md:p-4 bg-[var(--bento-bg)]">
                                    {/* Card title */}
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-3 md:pb-4">
                                        Tabella task
                                    </p>

                                    {/* Action bar: buttons + view toggle */}
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                                        {/* Left: action buttons */}
                                        <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                                            {(currentUserRole === "Admin" ||
                                                currentUserRole ===
                                                    "Shift Leader") && (
                                                <button
                                                    className="btn flex gap-2 items-center text-sm w-full md:w-fit md:w-auto justify-center"
                                                    onClick={handleTaskClick}
                                                >
                                                    <TaskIcon className="w-6 shrink-0" />
                                                    <p>Aggiungi task</p>
                                                </button>
                                            )}

                                            {GetTodayDate(startDate) ===
                                                GetTodayDate(new Date()) && (
                                                <button
                                                    className="btn secondary flex gap-2 items-center text-sm w-full md:w-fit md:w-auto justify-center"
                                                    onClick={() =>
                                                        handleSimulatorClick(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <SimulatorIcon className="w-6 shrink-0" />
                                                    <p>Imposta simulatore</p>
                                                </button>
                                            )}
                                        </div>

                                        {/* Right: view toggle — scrollable on very small screens */}
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
                                                    type="tasks"
                                                    loading={
                                                        loading ||
                                                        unavailableLoading
                                                    }
                                                    taskList={mergedTasks}
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

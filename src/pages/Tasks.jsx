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

function Tasks() {
    const { tasks, loading, fetchTasks } = useTasks();
    const {
        tasks: unavailableTasks,
        loading: unavailableLoading,
        fetchTasks: fetchUnavailableTasks,
    } = useUnavailableTasks();
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
    const { currentUserRole } = useUsers();
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

    const mergedTasks = useMemo(() => {
        const normalizedUnavailableTasks = (unavailableTasks || []).map(
            (task) => ({
                ...task,
                IS_UNAVAILABLE: true,
            }),
        );

        return [...(tasks || []), ...normalizedUnavailableTasks];
    }, [tasks, unavailableTasks]);

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
                            </div>

                            <div className="m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                                        Tabella task
                                    </p>

                                    <div className="flex items-center w-full justify-between gap-4">
                                        <div className="flex items-center gap-4">
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
                                                    "p-4 bg-[var(--pure-white)] rounded-xl"
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

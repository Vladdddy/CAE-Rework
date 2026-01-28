import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo } from "react";
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
import { exportTasksToPDF } from "../functions/ExportPDF.jsx";
import ArrowRightIcon from "../assets/icons/arrow-right.tsx";
import { GetSimulatorsList } from "../functions/Simulators.jsx";

function Tasks() {
    const { tasks, loading, fetchTasks } = useTasks();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    //const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    const [selectedAssignees, setSelectedAssignees] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const { currentUserRole, users } = useUsers();
    const [showFilters, setShowFilters] = useState(false);
    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState("");

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

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

    /*const handleSimulatorClick = () => {
        setIsSimulatorModalOpen(true);
    };*/

    /*const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
    };*/

    const handleExportPDF = () => {
        try {
            const tasksExported = exportTasksToPDF(tasks, startDate);
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
        } catch (error) {
            console.error("Errore durante l'esportazione del PDF:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'esportazione del PDF");
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
        }
    };

    const showFiltersFunction = () => {
        setShowFilters(!showFilters);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredTasks = useMemo(() => {
        let result = tasks;

        // Apply filter selections
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
    ]);

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

                                <button
                                    className="btn secondary"
                                    onClick={handleExportPDF}
                                >
                                    Export PDF
                                </button>
                            </div>

                            <div className="m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                                        Tabella task
                                    </p>

                                    <div className="flex items-center w-full justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <FilterIcon
                                                className="w-6 text-[var(--black)] icon cursor-pointer"
                                                onClick={showFiltersFunction}
                                            />
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

                                            {/* {GetTodayDate(startDate) ===
                                                GetTodayDate(new Date()) && (
                                                <button
                                                    className="btn secondary flex gap-2 items-center"
                                                    onClick={() =>
                                                        handleSimulatorClick(
                                                            true
                                                        )
                                                    }
                                                >
                                                    <SimulatorIcon className="w-6" />
                                                    <p>Imposta simulatore</p>
                                                </button>
                                            )} */}
                                        </div>

                                        {/* <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                                            <div className="flex items-center gap-2 bg-[var(--light-primary)] text-[var(--primary)] p-2 px-4 rounded-md cursor-pointer">
                                                <p className="text-sm">Oggi</p>
                                            </div>

                                            <div className="flex items-center gap-2 text-[var(--black)] p-2 px-4 rounded-md cursor-pointer hover:bg-[var(--light-primary)] transition-all duration-200">
                                                <p className="text-sm">
                                                    1 settimana
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-[var(--black)] p-2 px-4 rounded-md cursor-pointer hover:bg-[var(--light-primary)] transition-all duration-200">
                                                <p className="text-sm">
                                                    2 settimane
                                                </p>
                                            </div>
                                        </div> */}
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
                                        </div>
                                    )}

                                    <Table
                                        type="tasks"
                                        loading={loading}
                                        taskList={filteredTasks}
                                        date={startDate}
                                        onDeleteSuccess={handleSuccess}
                                    />
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
                />
            )}
            {/*isSimulatorModalOpen && (
                <SimulatorModal onClose={handleCloseSimulatorModal} />
            )*/}
            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Tasks;

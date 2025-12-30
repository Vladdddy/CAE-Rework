import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useState, useEffect, useMemo } from "react";
import DayIcon from "../assets/icons/day.tsx";
import NightIcon from "../assets/icons/night.tsx";
import SearchIcon from "../assets/icons/search.tsx";
import { GetSimulators } from "../functions/Simulators.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import {
    GetTaskCountTime,
    GetTaskCountStatus,
} from "../functions/TaskLength.jsx";
import Employee from "../components/data/Employee.jsx";

function Dashboard() {
    const { tasks, loading, fetchTasks } = useTasks();
    const { users, loading: usersLoading } = useUsers();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryOverview, setSearchQueryOverview] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;

        const query = searchQuery.toLowerCase();

        return tasks.filter(
            (task) =>
                task.TITLE?.toLowerCase().includes(query) ||
                task.DESCRIPTION?.toLowerCase().includes(query) ||
                task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                task.STATUS?.toLowerCase().includes(query)
        );
    }, [tasks, searchQuery]);

    const filteredTasksOverview = useMemo(() => {
        if (!searchQueryOverview.trim()) return tasks;

        const query = searchQueryOverview.toLowerCase();

        return tasks.filter(
            (task) =>
                task.TITLE?.toLowerCase().includes(query) ||
                task.DESCRIPTION?.toLowerCase().includes(query) ||
                task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                task.STATUS?.toLowerCase().includes(query)
        );
    }, [tasks, searchQueryOverview]);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const handleDeleteSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
        }
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Operazione completata con successo"
                    : "Errore durante l'operazione")
        );
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    return (
        <section className="flex">
            <Sidebar active="dashboard" isSidebarOpen={isSidebarOpen} />

            <div className="flex-1">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                />

                <div className="m-8 gap-8 grid grid-cols-3">
                    <div className="flex flex-col gap-8 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                        <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            Task di oggi
                        </p>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="search"
                                placeholder="Cerca task"
                                className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                            />
                        </div>
                        <div className="flex flex-col gap-8 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                    <GetTaskCountTime
                                        filteredTasks={filteredTasks}
                                        time="Diurno"
                                        date={new Date()}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard"
                                            time="Diurno"
                                            date={new Date()}
                                            taskList={filteredTasks}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Notte
                                    </p>
                                    <GetTaskCountTime
                                        filteredTasks={filteredTasks}
                                        time="Notturno"
                                        date={new Date()}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard"
                                            time="Notturno"
                                            date={new Date()}
                                            taskList={filteredTasks}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                        <div className="flex items-center flex-wrap gap-2 justify-between text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            <p>Panoramica task</p>
                        </div>

                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                            <input
                                value={searchQueryOverview}
                                onChange={(e) =>
                                    setSearchQueryOverview(e.target.value)
                                }
                                type="search"
                                placeholder="Cerca task"
                                className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                            />
                        </div>
                        <div className="flex flex-col gap-8 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Da definire
                                    </p>
                                    <GetTaskCountStatus
                                        filteredTasks={filteredTasksOverview}
                                        status="Da definire"
                                    />
                                </div>

                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetSimulators
                                        type="dashboard"
                                        status="Da definire"
                                        taskList={filteredTasksOverview}
                                        onDeleteSuccess={handleDeleteSuccess}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Non completato
                                    </p>
                                    <GetTaskCountStatus
                                        filteredTasks={filteredTasksOverview}
                                        status="Non completato"
                                    />
                                </div>

                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetSimulators
                                        type="dashboard"
                                        status="Non completato"
                                        taskList={filteredTasksOverview}
                                        onDeleteSuccess={handleDeleteSuccess}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Non iniziato
                                    </p>

                                    <GetTaskCountStatus
                                        filteredTasks={filteredTasksOverview}
                                        status="Non iniziato"
                                    />
                                </div>

                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetSimulators
                                        type="dashboard"
                                        status="Non iniziato"
                                        taskList={filteredTasksOverview}
                                        onDeleteSuccess={handleDeleteSuccess}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2 ">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        In corso
                                    </p>
                                    <GetTaskCountStatus
                                        filteredTasks={filteredTasksOverview}
                                        status="In corso"
                                    />
                                </div>

                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetSimulators
                                        type="dashboard"
                                        status="In corso"
                                        taskList={filteredTasksOverview}
                                        onDeleteSuccess={handleDeleteSuccess}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                        <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            Turni di oggi
                        </p>
                        <div className="flex flex-col gap-8 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Shift Leader
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {usersLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        users
                                            .filter(
                                                (user) =>
                                                    user.Role === "Shift Leader"
                                            )
                                            .map((user) => (
                                                <Employee
                                                    key={user.ID}
                                                    role={user.Role}
                                                    name={
                                                        user.Username.split(
                                                            "."
                                                        )[0]
                                                    }
                                                    shortName={user.Username?.substring(
                                                        0,
                                                        2
                                                    ).toUpperCase()}
                                                />
                                            ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    users.filter(
                                        (user) => user.Role === "Shift Leader"
                                    ).length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {usersLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        users
                                            .filter(
                                                (user) =>
                                                    user.Role === "Employee"
                                            )
                                            .map((user) => (
                                                <Employee
                                                    key={user.ID}
                                                    role={user.Role}
                                                    name={
                                                        user.Username.split(
                                                            "."
                                                        )[0]
                                                    }
                                                    shortName={user.Username?.substring(
                                                        0,
                                                        2
                                                    ).toUpperCase()}
                                                />
                                            ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    users.filter(
                                        (user) => user.Role === "Employee"
                                    ).length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Notte
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {usersLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        users
                                            .filter(
                                                (user) => user.Role === "Admin"
                                            )
                                            .map((user) => (
                                                <Employee
                                                    key={user.ID}
                                                    role={user.Role}
                                                    name={
                                                        user.Username.split(
                                                            "."
                                                        )[0]
                                                    }
                                                    shortName={user.Username?.substring(
                                                        0,
                                                        2
                                                    ).toUpperCase()}
                                                />
                                            ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    users.filter(
                                        (user) => user.Role === "Admin"
                                    ).length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Dashboard;

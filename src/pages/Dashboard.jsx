import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Popup from "../components/modals/Popup.jsx";
import { useState, useEffect, useMemo } from "react";
import DayIcon from "../assets/icons/day.tsx";
import NightIcon from "../assets/icons/night.tsx";
import SearchIcon from "../assets/icons/search.tsx";
import UserIcon from "../assets/icons/user.tsx";
import { GetSimulators } from "../functions/Simulators.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useLogbooks } from "../components/data/provider/logbookAPI/useLogbooks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useEmployeeShifts } from "../components/data/provider/employeeShiftsAPI/useEmployeeShifts";
import { useTaskSimOne } from "../components/data/provider/taskSimOneAPI/useTaskSimOne";
import {
    GetTaskCountTime,
    GetTaskCountStatus,
} from "../functions/TaskLength.jsx";
import Employee from "../components/data/Employee.jsx";
import TaskSimOne from "../components/data/TaskSimOne.jsx";
import TaskTest from "../components/data/TaskTest.jsx";
import Task from "../components/data/Task.jsx";

function Dashboard() {
    const { tasks, loading, fetchTasks } = useTasks();
    const { logbooks, loading: logbooksLoading, fetchLogbooks } = useLogbooks();
    const { users, loading: usersLoading } = useUsers();
    const { employeeShifts, loading: shiftsLoading } = useEmployeeShifts();
    const { taskSimOne } = useTaskSimOne();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showContrast, setShowContrast] = useState(() => {
        const saved = localStorage.getItem("showContrast");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryOverview, setSearchQueryOverview] = useState("");
    const [searchQueryEntries, setSearchQueryEntries] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Filter today's shifts by shift type
    const todayShifts = useMemo(() => {
        const todayDate = getTodayDate();
        return employeeShifts.filter((shift) => {
            if (!shift.SELECTED_DATE) return false;
            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            return shiftDate === todayDate;
        });
    }, [employeeShifts]);

    // Get users with their shifts for today
    const getUsersWithShifts = (role, shiftTypes) => {
        return users
            .filter((user) => user.Role === role)
            .map((user) => {
                const userShift = todayShifts.find(
                    (shift) => shift.EMPLOYEE_ID === user.ID,
                );

                if (!userShift || !shiftTypes.includes(userShift.SHIFT_TYPE)) {
                    return null;
                }

                return {
                    ...user,
                    shiftType: userShift.SHIFT_TYPE,
                };
            })
            .filter(Boolean);
    };

    const dayShiftTypes = ["O", "D", "OP"];
    const nightShiftTypes = ["ON", "N"];

    const shiftLeadersToday = getUsersWithShifts("Shift Leader", [
        ...dayShiftTypes,
        ...nightShiftTypes,
    ]);
    const dayShiftEmployees = getUsersWithShifts("Employee", dayShiftTypes);
    const nightShiftEmployees = getUsersWithShifts("Employee", nightShiftTypes);

    const SIMULATOR_MAP = {
        1: "109",
        2: "FTD",
        3: "139#1",
        4: "139#3",
        5: "169",
        6: "189",
    };

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;

        const query = searchQuery.toLowerCase();

        return tasks.filter(
            (task) =>
                task.TITLE?.toLowerCase().includes(query) ||
                task.DESCRIPTION?.toLowerCase().includes(query) ||
                task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                task.STATUS?.toLowerCase().includes(query),
        );
    }, [tasks, searchQuery]);

    const filteredTasksOverview = useMemo(() => {
        const todayDate = getTodayDate();

        // Filter out tasks with assignees and future tasks
        const tasksWithoutAssignees = tasks.filter((task) => {
            /* if (task.ASSIGNED_TO && task.ASSIGNED_TO.trim() !== "") {
                return false;
            } */

            // Filter out future tasks
            if (task.DATE) {
                const taskDate = task.DATE.split("T")[0];
                if (taskDate >= todayDate) {
                    return false;
                }
            }

            return true;
        });

        if (!searchQueryOverview.trim()) return tasksWithoutAssignees;

        const query = searchQueryOverview.toLowerCase();

        return tasksWithoutAssignees.filter(
            (task) =>
                task.TITLE?.toLowerCase().includes(query) ||
                task.DESCRIPTION?.toLowerCase().includes(query) ||
                task.STATUS?.toLowerCase().includes(query),
        );
    }, [tasks, searchQueryOverview]);

    const filteredEntries = useMemo(() => {
        const todayDate = getTodayDate();

        // Filter out entries with assignees and future entries
        const entriesWithoutAssignees = logbooks.filter((entry) => {
            /* if (entry.ASSIGNED_TO && entry.ASSIGNED_TO.trim() !== "") {
                return false;
            } */

            // Filter out future entries
            if (entry.DATE) {
                const entryDate = entry.DATE.split("T")[0];
                if (entryDate > todayDate) {
                    return false;
                }
            }

            return true;
        });

        if (!searchQueryEntries.trim()) return entriesWithoutAssignees;

        const query = searchQueryEntries.toLowerCase();

        return entriesWithoutAssignees.filter(
            (entry) =>
                entry.TITLE?.toLowerCase().includes(query) ||
                entry.DESCRIPTION?.toLowerCase().includes(query) ||
                entry.STATUS?.toLowerCase().includes(query),
        );
    }, [logbooks, searchQueryEntries]);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const handleDeleteSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
            await fetchLogbooks();
        }
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Operazione completata con successo"
                    : "Errore durante l'operazione"),
        );
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    useEffect(() => {
        localStorage.setItem("showContrast", JSON.stringify(showContrast));
    }, [showContrast]);

    useEffect(() => {
        const handleContrastChange = (event) => {
            setShowContrast(event.detail);
        };
        window.addEventListener("contrastChange", handleContrastChange);
        return () => {
            window.removeEventListener("contrastChange", handleContrastChange);
        };
    }, []);

    const getTaskSimOneListData = taskSimOne
        .filter((task) => {
            const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
            // Return true only if simulatorId exists in SIMULATOR_MAP
            return simulatorId && SIMULATOR_MAP[simulatorId];
        })
        .map((task) => {
            const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
            const simulatorName = SIMULATOR_MAP[simulatorId];

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
                SIMULATOR: simulatorName,
                TIME: "Notturno", // Add TIME property for GetSimulators filtering
                Data: task["Scheduled on"] ?? task.Data,
            };
        });

    return (
        <section className="flex h-screen overflow-hidden">
            <Sidebar
                active="dashboard"
                isSidebarOpen={isSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                <div className="overflow-y-auto h-full pb-6 sm:pb-10">
                    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 border border-[var(--light-primary)] rounded-lg p-3 sm:p-4 bg-[var(--bento-bg)] m-3 sm:m-4 lg:m-8">
                        <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            Turni di oggi
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-none xl:max-h-[calc(50vh-14rem)] overflow-visible xl:overflow-y-auto pr-0 xl:pr-1">
                            <div
                                className={`flex flex-col gap-2 ${showContrast ? "border-gray-500" : "border-[var(--light-primary)]"} bg-[var(--pure-white)] rounded-md p-4 flex-1 border`}
                            >
                                <div className="flex flex-row items-center gap-2">
                                    <UserIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Shift Leader presenti
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {usersLoading || shiftsLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        shiftLeadersToday.map((user) => (
                                            <Employee
                                                key={user.ID}
                                                role={user.Role}
                                                name={user.Username}
                                                shiftType={user.shiftType}
                                                shortName={user.Username?.substring(
                                                    0,
                                                    2,
                                                ).toUpperCase()}
                                            />
                                        ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    !shiftsLoading &&
                                    shiftLeadersToday.length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                            <div
                                className={`${showContrast ? "border-green-900" : "border-[var(--light-primary)]"} flex flex-col gap-2 bg-[var(--pure-white)] rounded-md p-4 flex-1 border`}
                            >
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {usersLoading || shiftsLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        dayShiftEmployees.map((user) => (
                                            <Employee
                                                key={user.ID}
                                                role={user.Role}
                                                name={user.Username}
                                                shiftType={user.shiftType}
                                                shortName={user.Username?.substring(
                                                    0,
                                                    2,
                                                ).toUpperCase()}
                                                time="Diurno"
                                            />
                                        ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    !shiftsLoading &&
                                    dayShiftEmployees.length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                            <div
                                className={`${showContrast ? "border-blue-900" : "border-[var(--light-primary)]"} flex flex-col gap-2 bg-[var(--pure-white)] rounded-md p-4 flex-1 border`}
                            >
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Notte
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {usersLoading || shiftsLoading ? (
                                        <div className="col-span-2 text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        nightShiftEmployees.map((user) => (
                                            <Employee
                                                key={user.ID}
                                                role={user.Role}
                                                name={user.Username}
                                                shiftType={user.shiftType}
                                                shortName={user.Username?.substring(
                                                    0,
                                                    2,
                                                ).toUpperCase()}
                                                time="Notturno"
                                            />
                                        ))
                                    )}
                                </div>
                                {!usersLoading &&
                                    !shiftsLoading &&
                                    nightShiftEmployees.length === 0 && (
                                        <p className="text-sm text-[var(--gray)] text-center mt-4">
                                            Nessun tecnico presente
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="m-3 sm:m-4 lg:m-8 gap-3 sm:gap-4 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                        <div
                            className={`${showContrast ? "border-[var(--purple-panoramica)]" : "border-[var(--light-primary)]"} flex flex-col gap-8 border rounded-lg p-4 bg-[var(--bento-bg)]`}
                        >
                            <p className="text-l text-[var(--weekend-text)] border-b border-[var(--light-primary)] pb-4">
                                Task di oggi
                            </p>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    type="search"
                                    placeholder="Cerca task"
                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                                />
                            </div>
                            <div className="flex flex-col gap-8 max-h-[50vh] lg:max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
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
                                            variant="today"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {loading ? (
                                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                                Caricamento...
                                            </div>
                                        ) : (
                                            <GetSimulators
                                                type="dashboard&today"
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
                                            variant="today"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {loading ? (
                                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                                Caricamento...
                                            </div>
                                        ) : (
                                            <GetSimulators
                                                type="dashboard&today"
                                                time="Notturno"
                                                date={new Date()}
                                                taskList={[
                                                    ...getTaskSimOneListData,
                                                    ...filteredTasks,
                                                ]}
                                                onDeleteSuccess={
                                                    handleDeleteSuccess
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`${showContrast ? "border-[var(--primary-panoramica)]" : "border-[var(--light-primary)]"} flex flex-col gap-8 border rounded-lg p-4 bg-[var(--bento-bg)]`}
                        >
                            <div className="flex items-center flex-wrap gap-2 justify-between text-l text-[var(--primary)] border-b border-[var(--light-primary)] pb-4">
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
                            <div className="flex flex-col gap-8 max-h-[50vh] lg:max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Da definire
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={
                                                filteredTasksOverview
                                            }
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
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Non completato
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={
                                                filteredTasksOverview
                                            }
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
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Non iniziato
                                        </p>

                                        <GetTaskCountStatus
                                            filteredTasks={
                                                filteredTasksOverview
                                            }
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
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 ">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            In corso
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={
                                                filteredTasksOverview
                                            }
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
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className={`${showContrast ? "border-[var(--orange-panoramica)]" : "border-[var(--light-primary)]"} flex flex-col gap-8 border rounded-lg p-4 bg-[var(--bento-bg)]`}
                        >
                            <div className="flex items-center flex-wrap gap-2 justify-between text-l text-[var(--orange)] border-b border-[var(--light-primary)] pb-4">
                                <p>Panoramica entry</p>
                            </div>

                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                                <input
                                    value={searchQueryEntries}
                                    onChange={(e) =>
                                        setSearchQueryEntries(e.target.value)
                                    }
                                    type="search"
                                    placeholder="Cerca entry"
                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                                />
                            </div>
                            <div className="flex flex-col gap-8 max-h-[50vh] lg:max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Da definire
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={filteredEntries}
                                            status="Da definire"
                                        />
                                    </div>

                                    {logbooksLoading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard&logbook"
                                            status="Da definire"
                                            taskList={filteredEntries}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Non completato
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={filteredEntries}
                                            status="Non completato"
                                        />
                                    </div>

                                    {logbooksLoading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard&logbook"
                                            status="Non completato"
                                            taskList={filteredEntries}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            Non iniziato
                                        </p>

                                        <GetTaskCountStatus
                                            filteredTasks={filteredEntries}
                                            status="Non iniziato"
                                        />
                                    </div>

                                    {logbooksLoading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard&logbook"
                                            status="Non iniziato"
                                            taskList={filteredEntries}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 ">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-l text-[var(--black)]">
                                            In corso
                                        </p>
                                        <GetTaskCountStatus
                                            filteredTasks={filteredEntries}
                                            status="In corso"
                                        />
                                    </div>

                                    {logbooksLoading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard&logbook"
                                            status="In corso"
                                            taskList={filteredEntries}
                                            onDeleteSuccess={
                                                handleDeleteSuccess
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div
                        className={`m-8 ${showContrast ? "border-[var(--orange-panoramica)]" : "border-[var(--light-primary)]"} flex flex-col gap-8 border rounded-lg p-4 bg-[var(--bento-bg)]`}
                    >
                        <div className="flex items-center flex-wrap gap-2 justify-between text-l text-[var(--black)] border-b border-[var(--light-primary)] pb-4">
                            <p>PM Task di oggi</p>
                        </div>

                        <div className="flex flex-col gap-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            {taskSimOneLoading ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Caricamento...
                                </div>
                            ) : taskSimOneError ? (
                                <div className="text-center text-sm text-[var(--error)] py-4">
                                    {taskSimOneError}
                                </div>
                            ) : taskSimOne.length === 0 ? (
                                <div className="text-center text-sm text-[var(--gray)] py-4">
                                    Nessun task PM Plan non completato per oggi
                                </div>
                            ) : (
                                <>{getTaskSimOneList}</>
                            )}
                        </div>
                    </div> */}
                </div>
            </div>
            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Dashboard;

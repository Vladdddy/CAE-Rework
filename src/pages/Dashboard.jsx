import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { useState, useEffect, useMemo } from "react";
import DayIcon from "../assets/icons/day.tsx";
import NightIcon from "../assets/icons/night.tsx";
import SearchIcon from "../assets/icons/search.tsx";
import Employee from "../components/data/Employee.jsx";
import GetSimulators from "../functions/Simulators.jsx";
import { useTasks } from "../components/data/provider/useTasks";

function Dashboard() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const { tasks, loading } = useTasks();
    const [searchQuery, setSearchQuery] = useState("");

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

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

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
                                    <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                        {filteredTasks.length} task
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard"
                                            bond="Diurno"
                                            taskList={filteredTasks}
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
                                    <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                        {filteredTasks.length} task
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--gray)] py-4">
                                            Caricamento...
                                        </div>
                                    ) : (
                                        <GetSimulators
                                            type="dashboard"
                                            bond="Notturno"
                                            taskList={filteredTasks}
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
                                    <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                        1 task
                                    </p>
                                </div>
                                <GetSimulators
                                    type="dashboard"
                                    bond="Da definire"
                                />
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Non iniziati
                                    </p>
                                </div>

                                {/*<GetSimulators
                                    type="dashboard"
                                    bond="Non iniziato"
                                />*/}

                                <p className="text-sm text-[var(--gray)] text-center mt-4">
                                    Nessun task presente
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        Non completati
                                    </p>
                                </div>

                                {/*<GetSimulators
                                    type="dashboard"
                                    bond="Non completato"
                                />*/}

                                <p className="text-sm text-[var(--gray)] text-center mt-4">
                                    Nessun task presente
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 ">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-l text-[var(--black)]">
                                        In corso
                                    </p>
                                </div>
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
                                    <Employee role="Shift Leader" />
                                    <Employee role="Shift Leader" />
                                    <Employee role="Shift Leader" />
                                    <Employee role="Shift Leader" />
                                    <Employee role="Shift Leader" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Employee role="Employee" />
                                    <Employee role="Employee" />
                                    <Employee role="Employee" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6 text-[var(--black)]" />
                                    <p className="text-l text-[var(--black)]">
                                        Notte
                                    </p>
                                </div>
                                <p className="text-sm text-[var(--gray)] text-center mt-4">
                                    Nessun tecnico presente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Dashboard;

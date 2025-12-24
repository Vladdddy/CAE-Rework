import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { useState, useEffect } from "react";
import DayIcon from "../assets/icons/day.tsx";
import NightIcon from "../assets/icons/night.tsx";
import SearchIcon from "../assets/icons/search.tsx";
import Task from "../components/Task.jsx";
import Employee from "../components/Employee.jsx";
import DisplayModal from "../components/modals/DisplayModal.jsx";
import GetSimulators from "../functions/Simulators.jsx";

function Dashboard() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleTaskClick = (taskInfo) => {
        setSelectedTask(taskInfo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    /*const testApi = async () => {
        const response = await fetch("http://localhost:3000/test");

        if (response.ok) {
            console.log(response);
        }
    };

    useEffect(() => {
        testApi();
    }, []);*/

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
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--separator)]" />
                            <input
                                type="search"
                                placeholder="Cerca task"
                                className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[#ffffff] w-full text-md placeholder:text-[var(--separator)] focus:outline-none focus:border-[var(--separator)]"
                            />
                        </div>
                        <div className="flex flex-col gap-8 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                    <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                        3 task
                                    </p>
                                </div>
                                <p className="text-sm text-[var(--gray)] text-center mt-4">
                                    Nessun task presente
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6" />
                                    <p className="text-l text-[var(--black)]">
                                        Notte
                                    </p>
                                </div>
                                <GetSimulators type="dashboard" bond="Notte" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)]">
                        <div className="flex items-center flex-wrap gap-2 justify-between text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            <p>Panoramica task</p>
                        </div>

                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--separator)]" />
                            <input
                                type="search"
                                placeholder="Cerca task"
                                className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[#ffffff] w-full text-md placeholder:text-[var(--separator)] focus:outline-none focus:border-[var(--separator)]"
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
                                {/* Example task, won't be like this */}
                                <Task
                                    taskInfo={""}
                                    onClick={() => handleTaskClick("Task 2")}
                                />
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
                                <Employee role="Shift Leader" />
                                <Employee role="Shift Leader" />
                                <Employee role="Shift Leader" />
                            </div>
                            <div className="flex flex-col gap-2 border-b border-[var(--light-primary)] pb-8">
                                <div className="flex flex-row items-center gap-2">
                                    <DayIcon className="w-6" />
                                    <p className="text-l text-[var(--black)]">
                                        Giorno
                                    </p>
                                </div>
                                <Employee role="Employee" />
                                <Employee role="Employee" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <NightIcon className="w-6" />
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

            {isModalOpen && (
                <DisplayModal
                    taskInfo={selectedTask}
                    onClose={handleCloseModal}
                />
            )}
        </section>
    );
}

export default Dashboard;

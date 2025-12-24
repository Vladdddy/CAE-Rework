import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect } from "react";
import SearchIcon from "../assets/icons/search.tsx";
import FilterIcon from "../assets/icons/filter.tsx";
import TaskIcon from "../assets/icons/tasks.tsx";
import SimulatorIcon from "../assets/icons/simulator.tsx";
import BackIcon from "../assets/icons/back.tsx";
import { GetTodayDate } from "../functions/CurrentTime.jsx";
import CreateModal from "../components/modals/CreateModal.jsx";

function Tasks() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);

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

                                <button className="btn secondary">
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
                                            <FilterIcon className="w-6 text-[var(--black)] icon cursor-pointer" />
                                            <div className="relative w-[20vw]">
                                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                                                <input
                                                    type="search"
                                                    placeholder="Cerca task"
                                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                                                />
                                            </div>

                                            <button
                                                className="btn flex gap-2 items-center"
                                                onClick={handleTaskClick}
                                            >
                                                <TaskIcon className="w-6" />
                                                <p>Aggiungi task</p>
                                            </button>

                                            {GetTodayDate(startDate) ===
                                                GetTodayDate(new Date()) && (
                                                <button className="btn secondary flex gap-2 items-center">
                                                    <SimulatorIcon className="w-6" />
                                                    <p>Imposta simulatore</p>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
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
                                        </div>
                                    </div>

                                    <Table type="tasks" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && <CreateModal onClose={handleCloseModal} />}
        </section>
    );
}

export default Tasks;

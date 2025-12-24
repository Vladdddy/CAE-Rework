import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import Calendar from "../components/Calendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/Table.jsx";
import { useState, useEffect } from "react";
import SearchIcon from "../assets/icons/search.tsx";
import FilterIcon from "../assets/icons/filter.tsx";
import TaskIcon from "../assets/icons/tasks.tsx";
import SimulatorIcon from "../assets/icons/simulator.tsx";
import BackIcon from "../assets/icons/back.tsx";
import { GetTodayDate } from "../functions/CurrentTime.jsx";

function Logbook() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });

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
                                        Tabella logbook
                                    </p>

                                    <div className="flex items-center w-full justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <FilterIcon className="w-6 text-[var(--black)] icon cursor-pointer" />
                                            <div className="relative w-[20vw]">
                                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--separator)]" />
                                                <input
                                                    type="search"
                                                    placeholder="Cerca task"
                                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[#ffffff] w-full text-md placeholder:text-[var(--separator)] focus:outline-none focus:border-[var(--separator)]"
                                                />
                                            </div>

                                            <button className="btn flex gap-2 items-center">
                                                <TaskIcon className="w-6" />
                                                <p>Nuova entry</p>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[var(--gray)] text-sm">
                                                Visualizza:
                                            </p>

                                            <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                                                <div className="flex items-center gap-2 bg-[var(--light-primary)] text-[var(--primary)] p-2 px-4 rounded-md cursor-pointer">
                                                    <p className="text-sm">
                                                        1 giorno
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-[var(--black)] p-2 px-4 rounded-md cursor-pointer hover:bg-[var(--light-primary)] transition-all duration-200">
                                                    <p className="text-sm">
                                                        7 giorni
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-[var(--black)] p-2 px-4 rounded-md cursor-pointer hover:bg-[var(--light-primary)] transition-all duration-200">
                                                    <p className="text-sm">
                                                        14 giorni
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Table type="logbook" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Logbook;

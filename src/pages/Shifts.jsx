import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";

function Shifts() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const adminShifts = ["O", "OP", "ON", "F", "M", "R", "C", "CA"];
    const employeeShifts = ["D", "N", "F", "M", "R", "C", "CA"];
    const shifts = ["O", "OP", "ON", "D", "N", "F", "M", "R", "C", "CA"];

    return (
        <section className="flex">
            <Sidebar active="shifts" isSidebarOpen={isSidebarOpen} />

            <div className="flex-1">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                />

                <div className="flex-1 overflow-y-auto">
                    <>
                        <div className="m-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
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

                        <div className="m-8 flex items-center justify-start gap-4">
                            {shifts.map((shift) => (
                                <div
                                    key={shift}
                                    className="flex flex-row items-center gap-4"
                                >
                                    <span className="text-center font-bold px-2 py-2 w-12 h-12 flex justify-center items-center rounded-lg bg-[var(--light-primary)] text-[var(--primary)]">
                                        {shift}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                </div>
            </div>
        </section>
    );
}

export default Shifts;

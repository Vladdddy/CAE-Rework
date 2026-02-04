import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import ShiftLegend from "../components/layout/ShiftLegend.jsx";

function Shifts() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    /*const adminShifts = ["O", "OP", "ON", "F", "M", "R", "C", "CA"];
    const employeeShifts = ["D", "N", "F", "M", "R", "C", "CA"];*/

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
                        <div className="m-8 flex items-start justify-between">
                            <div className="flex items-start gap-4">
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

                        <div className="m-8 flex flex-row items-center justify-between">
                            <ShiftLegend />
                        </div>
                    </>
                </div>
            </div>
        </section>
    );
}

export default Shifts;

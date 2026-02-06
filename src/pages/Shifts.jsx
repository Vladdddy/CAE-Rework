import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import ShiftMonthPicker from "../functions/ShiftMonthPicker.jsx";
import ShiftLegend from "../components/layout/ShiftLegend.jsx";
import ShiftsTable from "../components/data/ShiftsTable.jsx";

function Shifts() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [startDate, setStartDate] = useState(new Date());
    const [impagination, setImpagination] = useState(1);

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
                    <div className="m-8 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <ShiftMonthPicker
                                startDate={startDate}
                                setStartDate={setStartDate}
                                isCalendar={false}
                            />

                            <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                                <div
                                    className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer ${impagination === 1 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                    onClick={() => setImpagination(1)}
                                >
                                    <p className="text-sm">Tabella turni</p>
                                </div>

                                <div
                                    className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer ${impagination === 2 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                    onClick={() => setImpagination(2)}
                                >
                                    <p className="text-sm">Conteggio ore</p>
                                </div>
                            </div>
                        </div>

                        {impagination === 1 && (
                            <div className="flex items-start gap-4">
                                <button className="btn secondary">
                                    Export PDF
                                </button>

                                <ShiftLegend />
                            </div>
                        )}
                    </div>

                    <div className="m-8 flex flex-row items-start justify-between gap-8">
                        {impagination === 1 && (
                            <>
                                <ShiftsTable
                                    selectedMonth={startDate.toLocaleString(
                                        "it-IT",
                                        {
                                            month: "long",
                                            year: "numeric",
                                        },
                                    )}
                                />
                            </>
                        )}
                        {impagination === 2 && (
                            <div className="flex flex-col items-center gap-2 mt-16 flex-1">
                                <h2 className="text-lg text-center text-[var(--gray)]">
                                    Pagina in fase di sviluppo!
                                </h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Shifts;

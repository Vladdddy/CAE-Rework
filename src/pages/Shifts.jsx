import React from "react";
import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../components/data/provider/userAPI/userContext";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import ShiftMonthPicker from "../functions/ShiftMonthPicker.jsx";
import ShiftLegend from "../components/layout/ShiftLegend.jsx";
import HoursCountTableTest from "../components/data/HoursCountTableTest.jsx";
import SaveChangesModal from "../components/modals/SaveChanges.jsx";
import PatternIcon from "../assets/icons/pattern.tsx";
import ShiftsPattern from "../components/modals/ShiftsPattern.jsx";
import ShiftsTableVariant from "../components/data/ShiftsTableVariant.jsx";

function Shifts() {
    const { currentUserRole } = useContext(UserContext);
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [visibleScrollMonth, setVisibleScrollMonth] = useState(new Date());
    const [impagination, setImpagination] = useState(1);
    const [viewMonths, setViewMonths] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postChanges, setPostChanges] = useState({});
    const [putChanges, setPutChanges] = useState({});
    const [patternsModalOpen, setPatternsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        setVisibleScrollMonth(startDate);
    }, [startDate]);

    const handleChangesDetected = useCallback(
        (hasChanges, postData, putData) => {
            setPostChanges(postData);
            setPutChanges(putData);
            setIsModalOpen(hasChanges);
        },
        [],
    );

    const handlePatternApply = (newPostChanges, newPutChanges) => {
        // Use window function to apply pattern changes to ShiftsTableVariant
        if (window.applyPatternChanges) {
            window.applyPatternChanges(newPostChanges, newPutChanges);
        }

        // The ShiftsTableVariant will update its state and trigger handleChangesDetected
        // which will automatically open the save modal
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    /*const adminShifts = ["O", "OP", "ON", "F", "M", "R", "C", "CA"];
    const employeeShifts = ["D", "N", "F", "M", "R", "C", "CA"];*/

    return (
        <section className="flex h-screen">
            <Sidebar
                active="shifts"
                isSidebarOpen={isSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                <div className="flex-1 overflow-y-auto">
                    <div className="m-4 md:m-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex md:block items-center justify-center mb-8 md:mb-0">
                                <ShiftMonthPicker
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    isCalendar={false}
                                />
                            </div>

                            <div className="flex items-center w-full justify-start border border-[var(--light-primary)] rounded-md w-full md:w-fit p-1 overflow-x-auto">
                                <div
                                    className={`flex items-center justify-center flex-1 gap-2 p-2 px-4 rounded-md cursor-pointer whitespace-nowrap ${impagination === 1 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                    onClick={() => setImpagination(1)}
                                >
                                    <p className="text-sm">Tabella turni</p>
                                </div>

                                <div
                                    className={`flex items-center justify-center flex-1 gap-2 p-2 px-4 rounded-md cursor-pointer whitespace-nowrap ${impagination === 2 ? "bg-[var(--light-primary)] text-[var(--primary)]" : "text-[var(--black)] hover:bg-[var(--light-primary)]"} transition-all duration-200`}
                                    onClick={() => setImpagination(2)}
                                >
                                    <p className="text-sm">Conteggio ore</p>
                                </div>
                            </div>

                            {(currentUserRole === "Admin" ||
                                currentUserRole === "Shift Leader") && (
                                <div
                                    className="flex items-center gap-1 text-[var(--primary)] cursor-pointer hover:text-[var(--primary-hover)] w-fit my-4 md:my-0"
                                    onClick={() => setPatternsModalOpen(true)}
                                >
                                    <PatternIcon className="w-6" />

                                    <p className="text-md transition-all duration-200">
                                        Pattern shift
                                    </p>
                                </div>
                            )}
                        </div>

                        {impagination === 1 && (
                            <div className="flex items-center w-full justify-start border border-[var(--light-primary)] rounded-md w-full md:w-fit p-1 overflow-x-auto">
                                {[
                                    { label: "Mese corrente", months: 1 },
                                    { label: "3 Mesi", months: 3 },
                                ].map(({ label, months }) => (
                                    <div
                                        key={months}
                                        className={`flex items-center justify-center flex-1 gap-2 p-2 px-4 rounded-md cursor-pointer whitespace-nowrap ${
                                            viewMonths === months
                                                ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                                : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                                        } transition-all duration-200`}
                                        onClick={() => setViewMonths(months)}
                                    >
                                        <p className="text-sm">{label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {impagination === 1 && (
                            <div className="flex items-start gap-4 w-full lg:w-auto">
                                <ShiftLegend />
                            </div>
                        )}
                    </div>

                    {viewMonths === 3 && (
                        <p className="m-4 md:m-8 text-sm text-[var(--gray)] mb-2">
                            Mese corrente:{" "}
                            <span className=" ml-1 text-[var(--primary)] text-2xl font-semibold">
                                {visibleScrollMonth.toLocaleString("it-IT", {
                                    month: "long",
                                })}
                            </span>
                        </p>
                    )}

                    <div className="m-4 md:m-8 flex flex-row items-start justify-between gap-8">
                        {impagination === 1 && (
                            <>
                                <ShiftsTableVariant
                                    selectedMonth={startDate.toLocaleString(
                                        "it-IT",
                                        {
                                            month: "long",
                                            year: "numeric",
                                        },
                                    )}
                                    numMonths={viewMonths}
                                    onChangesDetected={handleChangesDetected}
                                    currentUserRole={currentUserRole}
                                    onVisibleMonthChange={setVisibleScrollMonth}
                                />
                            </>
                        )}
                        {impagination === 2 && (
                            <HoursCountTableTest
                                selectedMonth={startDate.toLocaleString(
                                    "it-IT",
                                    {
                                        month: "long",
                                        year: "numeric",
                                    },
                                )}
                            />
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <SaveChangesModal
                    onClose={handleModalClose}
                    postChanges={postChanges}
                    putChanges={putChanges}
                />
            )}

            {patternsModalOpen && (
                <ShiftsPattern
                    onClose={() => setPatternsModalOpen(false)}
                    onPatternApply={handlePatternApply}
                />
            )}
        </section>
    );
}

export default Shifts;

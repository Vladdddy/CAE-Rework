import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import { GetTableSimulators } from "../../functions/Simulators.jsx";
import {
    GetTaskCountTime,
    GetLogbookCountTime,
} from "../../functions/TaskLength.jsx";
import { useEffect, useRef, useState } from "react";
import { useUsers } from "./provider/userAPI/useUsers";
import { useEmployeeShifts } from "./provider/employeeShiftsAPI/useEmployeeShifts";

function Table({
    type,
    loading,
    taskList,
    logbookList,
    date,
    onDeleteSuccess,
}) {
    const [localDate, setLocalDate] = useState(date);
    const { users, loading: usersLoading } = useUsers();
    const { employeeShifts, loading: shiftsLoading } = useEmployeeShifts();

    const [dayExpanded, setDayExpanded] = useState(false);
    const [nightExpanded, setNightExpanded] = useState(false);
    const [dayHasOverflow, setDayHasOverflow] = useState(false);
    const [nightHasOverflow, setNightHasOverflow] = useState(false);
    const dayScrollRef = useRef(null);
    const nightScrollRef = useRef(null);

    useEffect(() => {
        setLocalDate(date);
        setDayExpanded(false);
        setNightExpanded(false);
    }, [date]);

    useEffect(() => {
        const el = dayScrollRef.current;
        if (!el) return;
        const check = () =>
            setDayHasOverflow(el.scrollHeight > el.clientHeight);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => ro.disconnect();
    }, [taskList, logbookList, loading, dayExpanded]);

    useEffect(() => {
        const el = nightScrollRef.current;
        if (!el) return;
        const check = () =>
            setNightHasOverflow(el.scrollHeight > el.clientHeight);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => ro.disconnect();
    }, [taskList, logbookList, loading, nightExpanded]);

    const dayShiftTypes = ["O", "D", "OP"];
    const nightShiftTypes = ["ON", "N", "OP"];

    const dateString =
        localDate instanceof Date
            ? localDate.toISOString().split("T")[0]
            : localDate?.split("T")[0];

    const todayShifts = employeeShifts.filter((shift) => {
        return (
            shift.SELECTED_DATE &&
            shift.SELECTED_DATE.split("T")[0] === dateString
        );
    });

    const getUsersWithShifts = (role, shiftTypes) => {
        return users
            .filter(
                (user) =>
                    (user.Role || "").trim().toLowerCase() ===
                    role.toLowerCase(),
            )
            .filter((user) => {
                const userShift = todayShifts.find(
                    (shift) => shift.EMPLOYEE_ID === user.ID,
                );
                return userShift && shiftTypes.includes(userShift.SHIFT_TYPE);
            });
    };

    const dayShiftLeaders = [
        ...getUsersWithShifts("Shift Leader", dayShiftTypes),
        ...getUsersWithShifts("Crew Chief", dayShiftTypes),
    ];
    const nightShiftLeaders = [
        ...getUsersWithShifts("Shift Leader", nightShiftTypes),
        ...getUsersWithShifts("Crew Chief", nightShiftTypes),
    ];
    const dayShiftEmployees = [
        ...getUsersWithShifts("Tech Staff", dayShiftTypes),
        ...getUsersWithShifts("Employee", dayShiftTypes),
    ];
    const nightShiftEmployees = [
        ...getUsersWithShifts("Tech Staff", nightShiftTypes),
        ...getUsersWithShifts("Employee", nightShiftTypes),
    ];

    const combinedList =
        type === "tasks&logbook"
            ? [...(taskList || []), ...(logbookList || [])]
            : taskList;

    // Helper: display first + last name when available, fall back to Username
    const formatUsername = (user) => {
        if (!user) return "";
        const first = (user.firstname || "").trim();
        const last = (user.lastname || "").trim();
        if (first || last) {
            return [
                first ? first.charAt(0).toUpperCase() + first.slice(1) : "",
                last ? last.charAt(0).toUpperCase() + last.slice(1) : "",
            ]
                .filter(Boolean)
                .join(" ");
        }
        return user.Username || (user.FullName || "").trim() || "";
    };

    // Shared employee badge list component
    const EmployeeBadges = ({ leaders, employees, loadingState }) => (
        <div className="flex flex-row flex-wrap md:justify-end gap-1 mt-1 sm:mt-0">
            {leaders.length > 0 &&
                leaders.map((leader) => (
                    <span
                        key={leader.ID}
                        className="bg-[var(--light-primary)] text-[var(--black)] text-xs px-2 py-1 rounded-md"
                    >
                        {formatUsername(leader)}
                    </span>
                ))}
            {loadingState ? (
                <span className="text-xs italic text-[var(--gray)]">
                    Caricamento...
                </span>
            ) : employees.length > 0 ? (
                employees.map((employee) => (
                    <span
                        key={employee.ID}
                        className="bg-[var(--light-primary)] text-[var(--gray)] text-xs px-2 py-1 rounded-md"
                    >
                        {formatUsername(employee)}
                    </span>
                ))
            ) : (
                <span className="text-xs italic text-[var(--gray)]">
                    Nessun dipendente in turno
                </span>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-12 md:gap-16 mt-4">
            {/* ── DAY SECTION ── */}
            <div>
                <div className="flex flex-col gap-2">
                    {/* Section header */}
                    <div className="border-b border-[var(--light-primary)] pb-2 mb-1">
                        {/* Title row */}
                        <div className="flex items-center gap-1 text-[var(--gray)] flex-wrap md:mb-4">
                            <DayIcon className="w-6 flex-shrink-0" />
                            <h1 className="text-md">Giorno</h1>

                            {(type === "tasks" || type === "tasks&logbook") && (
                                <GetTaskCountTime
                                    filteredTasks={taskList || []}
                                    time="Diurno"
                                    date={localDate}
                                />
                            )}

                            {type === "tasks&logbook" && (
                                <GetLogbookCountTime
                                    filteredLogbooks={logbookList || []}
                                    time="Diurno"
                                    date={localDate}
                                />
                            )}
                        </div>

                        {/* Employee badges — below title on mobile, inline on desktop */}
                        {!usersLoading && !shiftsLoading && (
                            <EmployeeBadges
                                leaders={dayShiftLeaders}
                                employees={dayShiftEmployees}
                                loadingState={usersLoading || shiftsLoading}
                            />
                        )}
                    </div>

                    {/* Simulator grid */}
                    <div className="overflow-x-auto -mx-1 px-1">
                        <div className="relative">
                            <div
                                ref={dayScrollRef}
                                className={`${dayExpanded ? "" : "max-h-[calc(80vh-16rem)]"} overflow-y-auto pr-1`}
                            >
                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetTableSimulators
                                        type={
                                            type === "tasks&logbook"
                                                ? "table&logbook"
                                                : "table"
                                        }
                                        time="Diurno"
                                        date={date}
                                        taskList={combinedList}
                                        onDeleteSuccess={onDeleteSuccess}
                                    />
                                )}
                            </div>
                            {dayHasOverflow && !dayExpanded && (
                                <button
                                    onClick={() => setDayExpanded(true)}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[var(--bg)] border border-[var(--light-primary)] text-[var(--primary)] rounded-full p-1 shadow-sm z-10 hover:bg-[var(--light-primary)] transition-colors"
                                    title="Espandi"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-8 h-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── NIGHT SECTION ── */}
            <div>
                <div className="flex flex-col gap-2">
                    {/* Section header */}
                    <div className="border-b border-[var(--light-primary)] pb-2 mb-1">
                        {/* Title row */}
                        <div className="flex items-center gap-1 text-[var(--gray)] flex-wrap md:mb-4">
                            <NightIcon className="w-6 flex-shrink-0" />
                            <h1 className="text-md">Notte</h1>

                            {(type === "tasks" || type === "tasks&logbook") && (
                                <GetTaskCountTime
                                    filteredTasks={taskList || []}
                                    time="Notturno"
                                    date={date}
                                />
                            )}

                            {type === "tasks&logbook" && (
                                <GetLogbookCountTime
                                    filteredLogbooks={logbookList || []}
                                    time="Notturno"
                                    date={localDate}
                                />
                            )}
                        </div>

                        {/* Employee badges */}
                        {!usersLoading && !shiftsLoading && (
                            <EmployeeBadges
                                leaders={nightShiftLeaders}
                                employees={nightShiftEmployees}
                                loadingState={usersLoading || shiftsLoading}
                            />
                        )}
                    </div>

                    {/* Simulator grid */}
                    <div className="overflow-x-auto -mx-1 px-1">
                        <div className="relative">
                            <div
                                ref={nightScrollRef}
                                className={`${nightExpanded ? "" : "max-h-[calc(80vh-20rem)]"} overflow-y-auto pr-1`}
                            >
                                {loading ? (
                                    <div className="text-center text-sm text-[var(--gray)] py-4">
                                        Caricamento...
                                    </div>
                                ) : (
                                    <GetTableSimulators
                                        type={
                                            type === "tasks&logbook"
                                                ? "table&logbook"
                                                : "table"
                                        }
                                        time="Notturno"
                                        date={date}
                                        taskList={combinedList}
                                        onDeleteSuccess={onDeleteSuccess}
                                    />
                                )}
                            </div>
                            {nightHasOverflow && !nightExpanded && (
                                <button
                                    onClick={() => setNightExpanded(true)}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[var(--bg)] border border-[var(--light-primary)] text-[var(--primary)] rounded-full p-1 shadow-sm z-10 hover:bg-[var(--light-primary)] transition-colors"
                                    title="Espandi"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-8 h-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Table;

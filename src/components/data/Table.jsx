import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import { GetTableSimulators } from "../../functions/Simulators.jsx";
import {
    GetTaskCountTime,
    GetLogbookCountTime,
} from "../../functions/TaskLength.jsx";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        setLocalDate(date);
    }, [date]);

    const dayShiftTypes = ["O", "D", "OP"];
    const nightShiftTypes = ["ON", "N", "OP"];

    // Convert date to string format for comparison
    const dateString =
        localDate instanceof Date
            ? localDate.toISOString().split("T")[0]
            : localDate?.split("T")[0];

    // Filter shifts for today
    const todayShifts = employeeShifts.filter((shift) => {
        return (
            shift.SELECTED_DATE &&
            shift.SELECTED_DATE.split("T")[0] === dateString
        );
    });

    // Function to get users with specific role and shift types
    const getUsersWithShifts = (role, shiftTypes) => {
        return users
            .filter((user) => user.Role === role)
            .filter((user) => {
                const userShift = todayShifts.find(
                    (shift) => shift.EMPLOYEE_ID === user.ID,
                );
                return userShift && shiftTypes.includes(userShift.SHIFT_TYPE);
            });
    };

    const dayShiftLeaders = getUsersWithShifts("Shift Leader", dayShiftTypes);
    const nightShiftLeaders = getUsersWithShifts(
        "Shift Leader",
        nightShiftTypes,
    );
    const dayShiftEmployees = getUsersWithShifts("Employee", dayShiftTypes);
    const nightShiftEmployees = getUsersWithShifts("Employee", nightShiftTypes);

    // Combine lists for display when type is tasks&logbook
    const combinedList =
        type === "tasks&logbook"
            ? [...(taskList || []), ...(logbookList || [])]
            : taskList;

    return (
        <div className="grid grid-cols-1 gap-16 mt-4">
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                            <DayIcon className="w-6" />
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

                            <div className="flex flex-row items-end gap-1 flex-1 justify-end">
                                {!usersLoading &&
                                    !shiftsLoading &&
                                    dayShiftLeaders.length > 0 && (
                                        <div className="flex flex-row flex-wrap gap-1 text-xs text-[var(--black)]">
                                            {dayShiftLeaders.map((leader) => (
                                                <span
                                                    className="bg-[var(--light-primary)] px-2 py-1 rounded-md"
                                                    key={leader.ID}
                                                >
                                                    {leader.Username.split(
                                                        ".",
                                                    )[0]
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        leader.Username.split(
                                                            ".",
                                                        )[0].slice(1)}
                                                    {leader.Username.split(
                                                        ".",
                                                    )[1] && (
                                                        <>
                                                            {" "}
                                                            {leader.Username.split(
                                                                ".",
                                                            )[1]
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                leader.Username.split(
                                                                    ".",
                                                                )[1].slice(1)}
                                                        </>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                <div className="flex flex-row flex-wrap gap-1 text-xs text-[var(--gray)]">
                                    {usersLoading || shiftsLoading ? (
                                        <span className="italic">
                                            Caricamento...
                                        </span>
                                    ) : dayShiftEmployees.length > 0 ? (
                                        dayShiftEmployees.map((employee) => (
                                            <span
                                                key={employee.ID}
                                                className="bg-[var(--light-primary)] px-2 py-1 rounded-md"
                                            >
                                                {employee.Username.split(".")[0]
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    employee.Username.split(
                                                        ".",
                                                    )[0].slice(1)}
                                                {employee.Username.split(
                                                    ".",
                                                )[1] && (
                                                    <>
                                                        {" "}
                                                        {employee.Username.split(
                                                            ".",
                                                        )[1]
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            employee.Username.split(
                                                                ".",
                                                            )[1].slice(1)}
                                                    </>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="italic">
                                            Nessun dipendente assegnato
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[calc(80vh-16rem)] overflow-y-auto pr-1">
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
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                            <NightIcon className="w-6" />
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

                            <div className="flex flex-row items-end gap-1 flex-1 justify-end">
                                {!usersLoading &&
                                    !shiftsLoading &&
                                    nightShiftLeaders.length > 0 && (
                                        <div className="flex flex-row flex-wrap gap-1 text-xs text-[var(--black)]">
                                            {nightShiftLeaders.map((leader) => (
                                                <span
                                                    className="bg-[var(--light-primary)] px-2 py-1 rounded-md"
                                                    key={leader.ID}
                                                >
                                                    {leader.Username.split(
                                                        ".",
                                                    )[0]
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        leader.Username.split(
                                                            ".",
                                                        )[0].slice(1)}
                                                    {leader.Username.split(
                                                        ".",
                                                    )[1] && (
                                                        <>
                                                            {" "}
                                                            {leader.Username.split(
                                                                ".",
                                                            )[1]
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                leader.Username.split(
                                                                    ".",
                                                                )[1].slice(1)}
                                                        </>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                <div className="flex flex-row flex-wrap gap-1 text-xs text-[var(--gray)]">
                                    {usersLoading || shiftsLoading ? (
                                        <span className="italic">
                                            Caricamento...
                                        </span>
                                    ) : nightShiftEmployees.length > 0 ? (
                                        nightShiftEmployees.map((employee) => (
                                            <span
                                                key={employee.ID}
                                                className="bg-[var(--light-primary)] px-2 py-1 rounded-md"
                                            >
                                                {employee.Username.split(".")[0]
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    employee.Username.split(
                                                        ".",
                                                    )[0].slice(1)}
                                                {employee.Username.split(
                                                    ".",
                                                )[1] && (
                                                    <>
                                                        {" "}
                                                        {employee.Username.split(
                                                            ".",
                                                        )[1]
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            employee.Username.split(
                                                                ".",
                                                            )[1].slice(1)}
                                                    </>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="italic">
                                            Nessun dipendente assegnato
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
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
                </div>
            </div>
        </div>
    );
}

export default Table;

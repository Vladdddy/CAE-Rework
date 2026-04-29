{
    /*
     *
     *
     *
     *This one is the deprecated one, use HoursCountTableTest
     *
     *
     *
     */
}

import React, { useState, useEffect } from "react";
import { useUsers } from "./provider/userAPI/useUsers.js";
import { useEmployeeShifts } from "./provider/employeeShiftsAPI/useEmployeeShifts.js";

function HoursCountTable({ selectedMonth }) {
    const { users, loading } = useUsers();
    const { employeeShifts } = useEmployeeShifts();
    const [orderedUsers, setOrderedUsers] = useState([]);

    // Define shift hours mapping
    const shiftHours = {
        // 11-hour shifts
        D: 11,
        N: 11,
        F: 11,
        M: 11,
        CG: 11,
        // 8-hour shifts
        O: 8,
        OP: 8,
        ON: 8,
        C: 8,
        T: 8,
        P: 8,
    };

    useEffect(() => {
        setOrderedUsers(users);
    }, [users]);

    const parseSelectedMonth = () => {
        const months = {
            gennaio: 0,
            febbraio: 1,
            marzo: 2,
            aprile: 3,
            maggio: 4,
            giugno: 5,
            luglio: 6,
            agosto: 7,
            settembre: 8,
            ottobre: 9,
            novembre: 10,
            dicembre: 11,
        };

        const [monthName, year] = selectedMonth.split(" ");
        const monthIndex = months[monthName.toLowerCase()];
        return new Date(parseInt(year), monthIndex, 1);
    };

    const date = parseSelectedMonth();

    const formatUsername = (user) => {
        return (
            user.split(".")[0].charAt(0).toUpperCase() +
            user.split(".")[0].slice(1) +
            " " +
            (user.split(".")[1].charAt(0).toUpperCase() +
                user.split(".")[1].slice(1))
        );
    };

    const calculateUserHours = (user) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");

        const userShifts = employeeShifts.filter((shift) => {
            if (shift.EMPLOYEE_ID !== user.ID) return false;
            if (!shift.SELECTED_DATE) return false;

            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            const [shiftYear, shiftMonth] = shiftDate.split("-");

            return shiftYear === String(year) && shiftMonth === month;
        });

        let totalHours = 0;
        userShifts.forEach((shift) => {
            const hours = shiftHours[shift.SHIFT_TYPE] || 0;
            totalHours += hours;
        });

        return totalHours;
    };

    const calculateUserVacationHours = (user) => {
        const year = date.getFullYear();
        const endMonth = date.getMonth() + 1;

        const vacationShifts = employeeShifts.filter((shift) => {
            if (shift.EMPLOYEE_ID !== user.ID) return false;
            if (!shift.SELECTED_DATE) return false;
            if (shift.SHIFT_TYPE !== "F") return false;

            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            const [shiftYear, shiftMonth] = shiftDate.split("-");

            return (
                parseInt(shiftYear) === year && parseInt(shiftMonth) <= endMonth
            );
        });

        return vacationShifts.length * (shiftHours["F"] || 0);
    };

    // Group users by role
    const adminUsers = orderedUsers.filter(
        (user) => user.Role === "Admin" || user.Role === "Shift Leader",
    );
    const employeeUsers = orderedUsers.filter(
        (user) => user.Role === "Employee",
    );

    return (
        <div className="w-full overflow-auto max-h-[calc(100vh-200px)]">
            <div className="inline-block min-w-full align-middle">
                {/* Header */}
                <div className="flex sticky top-0 z-40 border border-[var(--separator)] rounded-md">
                    <div className="bg-[var(--bento-bg)] border-r border-[var(--separator)] min-w-[300px] w-[300px]">
                        <p className="text-[var(--black)] font-bold text-md p-4 text-start">
                            Nome Dipendente
                        </p>
                    </div>
                    <div className="bg-[var(--bento-bg)] min-w-[200px] w-[200px] border-r border-[var(--separator)]">
                        <p className="text-[var(--black)] font-bold text-md p-4 text-center">
                            Ore Totali
                        </p>
                    </div>
                    <div className="bg-[var(--bento-bg)] min-w-[240px] w-[240px]">
                        <p className="text-[var(--black)] font-bold text-md p-4 text-center">
                            Ore ferie da inizio anno
                        </p>
                    </div>
                </div>

                {!loading ? (
                    <>
                        {/* Admin/Shift Leader Section */}
                        {adminUsers.length > 0 && (
                            <>
                                <div className="flex border-b border-l border-r border-[var(--separator)] bg-[var(--light-primary)]">
                                    <div className="border-r border-[var(--separator)] min-w-[300px] w-[300px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-start">
                                            SL
                                        </p>
                                    </div>
                                    <div className="border-r border-[var(--separator)] min-w-[200px] w-[200px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-center"></p>
                                    </div>
                                    <div className="min-w-[240px] w-[240px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-center"></p>
                                    </div>
                                </div>
                                {adminUsers.map((user) => (
                                    <div
                                        key={`admin-${user.ID}`}
                                        className="flex border-b border-l border-r border-[var(--separator)] hover:bg-[var(--light-primary)] transition-all duration-200"
                                    >
                                        <div className="border-r border-[var(--separator)] min-w-[300px] w-[300px]">
                                            <p className="text-[var(--black)] text-sm p-4 text-start">
                                                {formatUsername(user.Username)}
                                            </p>
                                        </div>
                                        <div className="border-r border-[var(--separator)] min-w-[200px] w-[200px]">
                                            <p className="text-[var(--primary)] font-bold text-md p-4 text-center">
                                                {calculateUserHours(user)}h
                                            </p>
                                        </div>
                                        <div className="min-w-[240px] w-[240px]">
                                            <p className="text-[var(--primary)] font-bold text-md p-4 text-center">
                                                {calculateUserVacationHours(
                                                    user,
                                                )}
                                                h
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Employees Section */}
                        {employeeUsers.length > 0 && (
                            <>
                                <div className="flex border-b border-l border-r border-[var(--separator)] bg-[var(--light-primary)]">
                                    <div className="border-r border-[var(--separator)] min-w-[300px] w-[300px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-start">
                                            Tecnici
                                        </p>
                                    </div>
                                    <div className="border-r border-[var(--separator)] min-w-[200px] w-[200px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-center"></p>
                                    </div>
                                    <div className="min-w-[240px] w-[240px]">
                                        <p className="text-[var(--gray)] font-semibold text-sm p-3 text-center"></p>
                                    </div>
                                </div>
                                {employeeUsers.map((user) => (
                                    <div
                                        key={`employee-${user.ID}`}
                                        className="flex border-b border-l border-r border-[var(--separator)] hover:bg-[var(--light-primary)] transition-all duration-200"
                                    >
                                        <div className="border-r border-[var(--separator)] min-w-[300px] w-[300px]">
                                            <p className="text-[var(--black)] text-sm p-4 text-start">
                                                {formatUsername(user.Username)}
                                            </p>
                                        </div>
                                        <div className="border-r border-[var(--separator)] min-w-[200px] w-[200px]">
                                            <p className="text-[var(--primary)] font-bold text-md p-4 text-center">
                                                {calculateUserHours(user)}h
                                            </p>
                                        </div>
                                        <div className="min-w-[240px] w-[240px]">
                                            <p className="text-[var(--primary)] font-bold text-md p-4 text-center">
                                                {calculateUserVacationHours(
                                                    user,
                                                )}
                                                h
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    <h1 className="p-8 text-[var(--black)] text-md">
                        Caricamento...
                    </h1>
                )}
            </div>
        </div>
    );
}

export default HoursCountTable;

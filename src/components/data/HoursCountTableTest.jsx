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
        // Get year and month from the selected date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");

        // Filter shifts for this user in the selected month
        const userShifts = employeeShifts.filter((shift) => {
            if (shift.EMPLOYEE_ID !== user.ID) return false;
            if (!shift.SELECTED_DATE) return false;

            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            const [shiftYear, shiftMonth] = shiftDate.split("-");

            return shiftYear === String(year) && shiftMonth === month;
        });

        // Calculate total hours
        let totalHours = 0;
        userShifts.forEach((shift) => {
            const hours = shiftHours[shift.SHIFT_TYPE] || 0;
            totalHours += hours;
        });

        return totalHours;
    };

    // Group users by role
    const adminUsers = orderedUsers.filter(
        (user) => user.Role === "Admin" || user.Role === "Shift Leader",
    );
    const employeeUsers = orderedUsers.filter(
        (user) => user.Role === "Employee",
    );

    return (
        <div className="flex-1 max-h-[calc(100vh-14rem)] overflow-x-auto rounded-lg pb-1">
            <div className="min-w-max bg-[var(--bento-bg)] border-t border-[var(--separator)] rounded-lg">
                <div className="flex sticky top-0 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Utente
                            </p>
                        </div>
                    </div>
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                GG ferie da inizio anno
                            </p>
                        </div>
                    </div>
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Ore annuali
                            </p>
                        </div>
                    </div>
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Ore mensili
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex sticky top-0 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--black)] text-sm p-4 text-start">
                                Mario Rossi
                            </p>
                        </div>
                    </div>
                    <div className="bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--black)] text-lg p-4 text-start">
                                12
                            </p>
                        </div>
                    </div>
                    <div className="bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full">
                            <p className="text-[var(--black)] text-lg p-4 text-start">
                                2012
                            </p>
                        </div>
                    </div>
                    <div className="flex bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] flex-1 w-full">
                        <div className="flex-1 w-full flex items-center">
                            <p className="text-[var(--black)] bg-[var(--light-primary)] text-[var(--primary)] text-lg p-4 text-start">
                                160
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HoursCountTable;

import React, { useState, useEffect } from "react";
import { useUsers } from "./provider/userAPI/useUsers.js";
import { useEmployeeShifts } from "./provider/employeeShiftsAPI/useEmployeeShifts.js";

const MONTH_LABELS = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
];

function HoursCountTableTest({ selectedMonth }) {
    const { users, loading } = useUsers();
    const { employeeShifts } = useEmployeeShifts();
    const [orderedUsers, setOrderedUsers] = useState([]);

    const shiftHours = {
        D: 11,
        N: 11,
        F: 11,
        M: 11,
        CG: 11,
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
    const selectedYear = String(date.getFullYear());
    const selectedMonthIndex = date.getMonth(); // 0-based

    const formatUsername = (user) => {
        const parts = user.split(".");
        if (parts.length < 2) return user;
        return (
            parts[0].charAt(0).toUpperCase() +
            parts[0].slice(1) +
            " " +
            parts[1].charAt(0).toUpperCase() +
            parts[1].slice(1)
        );
    };

    const calculateUserStats = (user) => {
        const userShifts = employeeShifts.filter((shift) => {
            if (shift.EMPLOYEE_ID !== user.ID) return false;
            if (!shift.SELECTED_DATE) return false;
            const shiftYear = shift.SELECTED_DATE.split("T")[0].split("-")[0];
            return shiftYear === selectedYear;
        });

        let annualHours = 0;
        let annualDaysOff = 0;
        // Index 0 = January, 11 = December
        const monthlyHours = new Array(12).fill(0);

        userShifts.forEach((shift) => {
            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            const shiftMonthIndex = parseInt(shiftDate.split("-")[1], 10) - 1;
            const isOff = shift.SHIFT_TYPE === "F";
            const hours = shiftHours[shift.SHIFT_TYPE] || 0;

            if (isOff) {
                annualDaysOff += 1;
            } else {
                annualHours += hours;
                monthlyHours[shiftMonthIndex] += hours;
            }
        });

        return { annualHours, annualDaysOff, monthlyHours };
    };

    const adminUsers = orderedUsers.filter(
        (user) => user.Role === "Admin" || user.Role === "Shift Leader",
    );
    const employeeUsers = orderedUsers.filter(
        (user) => user.Role === "Employee",
    );

    const renderRow = (user, keyPrefix) => {
        const { annualHours, annualDaysOff, monthlyHours } =
            calculateUserStats(user);
        return (
            <div
                key={`${keyPrefix}-${user.ID}`}
                className="flex border-b border-l border-r border-[var(--separator)] hover:bg-[var(--light-primary)] transition-all duration-200"
            >
                {/* Name */}
                <div className="bg-[var(--bento-bg)] border-r border-[var(--separator)] min-w-[200px] w-[200px]">
                    <p className="text-[var(--black)] text-sm p-4 text-start">
                        {formatUsername(user.Username)}
                    </p>
                </div>
                {/* Days off */}
                <div className="bg-[var(--bento-bg)] border-r border-[var(--separator)] min-w-[140px] w-[140px]">
                    <p className="text-[var(--black)] text-sm p-4 text-start">
                        {annualDaysOff}
                    </p>
                </div>
                {/* Annual hours */}
                <div className="bg-[var(--bento-bg)] border-r border-[var(--separator)] min-w-[120px] w-[120px]">
                    <p className="text-[var(--black)] text-sm p-4 text-start">
                        {annualHours}h
                    </p>
                </div>
                {/* Monthly hours — one cell per month */}
                {monthlyHours.map((hours, i) => (
                    <div
                        key={i}
                        className={`border-r border-[var(--separator)] min-w-[80px] w-[80px] ${
                            i === selectedMonthIndex
                                ? "bg-[var(--light-primary)]"
                                : "bg-[var(--bento-bg)]"
                        }`}
                    >
                        <p
                            className={`text-sm p-4 text-start ${
                                i === selectedMonthIndex
                                    ? "text-[var(--primary)] font-bold"
                                    : "text-[var(--black)]"
                            }`}
                        >
                            {hours}h
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderSectionHeader = () => (
        <div className="flex border-b border-l border-r border-[var(--separator)] bg-[var(--light-primary)]">
            <div className="min-w-[140px] w-[140px] border-r border-[var(--separator)]" />
            <div className="min-w-[120px] w-[120px] border-r border-[var(--separator)]" />
            {MONTH_LABELS.map((_, i) => (
                <div
                    key={i}
                    className="min-w-[80px] w-[80px] border-r border-[var(--separator)]"
                />
            ))}
        </div>
    );

    return (
        <div className="flex-1 max-h-[calc(100vh-14rem)] overflow-x-auto rounded-lg pb-1">
            <div className="min-w-max bg-[var(--bento-bg)] border-t border-[var(--separator)] rounded-lg">
                {/* Header */}
                <div className="flex sticky top-0 z-30">
                    <div className="bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] min-w-[200px] w-[200px]">
                        <p className="text-[var(--gray)] text-sm p-4 text-start">
                            Utente
                        </p>
                    </div>
                    <div className="bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] min-w-[140px] w-[140px]">
                        <p className="text-[var(--gray)] text-sm p-4 text-start">
                            GG ferie da inizio anno
                        </p>
                    </div>
                    <div className="bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] min-w-[120px] w-[120px]">
                        <p className="text-[var(--gray)] text-sm p-4 text-start">
                            Ore annuali
                        </p>
                    </div>
                    {MONTH_LABELS.map((label, i) => (
                        <div
                            key={i}
                            className={`border-r border-b border-l border-[var(--separator)] min-w-[80px] w-[80px] ${
                                i === selectedMonthIndex
                                    ? "bg-[var(--light-primary)]"
                                    : "bg-[var(--bento-bg)]"
                            }`}
                        >
                            <p
                                className={`text-sm p-4 text-center ${
                                    i === selectedMonthIndex
                                        ? "text-[var(--primary)] font-bold"
                                        : "text-[var(--gray)]"
                                }`}
                            >
                                {label}
                            </p>
                        </div>
                    ))}
                </div>

                {!loading ? (
                    <>
                        {adminUsers.length > 0 && (
                            <>
                                {renderSectionHeader("SL")}
                                {adminUsers.map((user) =>
                                    renderRow(user, "admin"),
                                )}
                            </>
                        )}
                        {employeeUsers.length > 0 && (
                            <>
                                {renderSectionHeader("Tecnici")}
                                {employeeUsers.map((user) =>
                                    renderRow(user, "employee"),
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <p className="p-8 text-[var(--black)] text-sm">
                        Caricamento...
                    </p>
                )}
            </div>
        </div>
    );
}

export default HoursCountTableTest;

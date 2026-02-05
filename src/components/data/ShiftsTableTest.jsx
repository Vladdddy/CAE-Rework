import React from "react";
import { useUsers } from "./provider/userAPI/useUsers";

function ShiftsTable({ selectedMonth }) {
    const { users } = useUsers();

    // Parse selectedMonth to get the date
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

    // Get number of days in the selected month
    const date = parseSelectedMonth();
    const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
    ).getDate();

    // Generate array of days
    const numericDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate day of week for each day in the month
    const dayOfWeekLabels = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const dayOfWeek = numericDays.map((day) => {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        return dayOfWeekLabels[currentDate.getDay()];
    });

    const formatUsername = (user) => {
        return (
            user.split(".")[0].charAt(0).toUpperCase() +
            user.split(".")[0].slice(1) +
            " " +
            (user.split(".")[1].charAt(0).toUpperCase() +
                user.split(".")[1].slice(1))
        );
    };

    return (
        <div className="flex-1 w-[800px] max-h-[calc(100vh-14rem)] flex flex-col bg-[var(--bento-bg)] border border-[var(--separator)] rounded-lg overflow-x-auto pb-1">
            <div className="sticky top-0 z-30 flex flex-row">
                <p className="sticky left-0 z-20 text-[var(--gray)] bg-[var(--bento-bg)] text-sm p-4 text-start border-r border-b border-[var(--separator)] min-w-[240px]">
                    Giorno della settimana
                </p>
                <div className="flex flex-row border-b border-[var(--separator)]">
                    {dayOfWeek.map((day, index) => (
                        <p
                            key={`dow-${index}`}
                            className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            {day}
                        </p>
                    ))}
                </div>
            </div>
            <div className="sticky top-10 z-30 flex flex-row">
                <p className="sticky left-0 z-20 text-[var(--gray)] bg-[var(--bento-bg)] text-sm p-4 text-start border-r border-b border-[var(--separator)] min-w-[240px]">
                    Giorno del mese
                </p>
                <div className="flex flex-row border-b border-[var(--separator)]">
                    {numericDays.map((day, index) => (
                        <p
                            key={`day-${index}`}
                            className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            {day}
                        </p>
                    ))}
                </div>
            </div>
            <div className="sticky top-20 z-30 flex flex-row">
                <p className="sticky left-0 z-20 text-[var(--gray)] bg-[var(--light-primary)] text-sm p-4 text-start border-r border-b border-[var(--separator)] min-w-[240px]">
                    Conteggio turni
                </p>
                <div className="flex flex-row border-b border-[var(--separator)]">
                    {numericDays.map((day, index) => (
                        <div
                            key={`day-${index}`}
                            className="text-[var(--primary)] bg-[var(--light-primary)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            <span className="text-[var(--green)] border border-[var(--green)] bg-green-900 p-2 rounded mr-2">
                                0
                            </span>
                            <span className="text-[var(--red)] border border-[var(--red)] bg-red-900 p-2 rounded">
                                0
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {users.map((user) => (
                <div className="flex flex-row">
                    <p className="sticky left-0 z-20 text-[var(--gray)] bg-[var(--bento-bg)] text-sm p-4 text-start border-r border-b border-[var(--separator)] min-w-[240px]">
                        {formatUsername(user.Username)}
                    </p>
                    <div className="flex flex-row border-b border-[var(--separator)]">
                        {numericDays.map((day, index) => (
                            <p
                                key={`day-${index}`}
                                className="text-[var(--black)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                            >
                                {day % 3 === 0 ? "D" : "N"}
                            </p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ShiftsTable;

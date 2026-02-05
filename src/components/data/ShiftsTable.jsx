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
        <div className="flex-1 w-[800px] max-h-[calc(100vh-14rem)] flex bg-[var(--bento-bg)] border border-[var(--separator)] rounded-lg overflow-x-auto pb-1">
            <div className="flex flex-col max-w-[240px] border-r border-[var(--separator)] sticky left-0 z-20">
                <div className="min-w-max">
                    <p className="sticky top-0 z-20 text-[var(--gray)] bg-[var(--bento-bg)] text-sm p-4 text-start border-b border-[var(--separator)] truncate max-w-[240px]">
                        Giorno della settimana
                    </p>
                    <p className="sticky top-10 z-20 text-[var(--gray)] bg-[var(--bento-bg)] text-sm p-4 text-start border-b border-[var(--separator)] truncate max-w-[240px]">
                        Giorno del mese
                    </p>
                    <p className="sticky top-20 z-20 text-[var(--gray)] bg-[var(--light-primary)] text-sm p-4 text-start border-b border-[var(--separator)] truncate max-w-[240px]">
                        Conteggio turni
                    </p>
                    {users.map((user) => (
                        <p className="text-[var(--black)] bg-[var(--bento-bg)] text-sm p-4 text-start border-b border-[var(--separator)] truncate max-w-[240px]">
                            {formatUsername(user.Username)}
                        </p>
                    ))}
                </div>
            </div>
            <div className="flex flex-col min-w-max">
                <div className="flex flex-row border-b border-[var(--separator)] sticky top-0 z-10">
                    {dayOfWeek.map((day, index) => (
                        <p
                            key={`dow-${index}`}
                            className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            {day}
                        </p>
                    ))}
                </div>
                <div className="flex flex-row border-b border-[var(--separator)] sticky top-10 z-10">
                    {numericDays.map((day, index) => (
                        <p
                            key={`day-${index}`}
                            className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            {day}
                        </p>
                    ))}
                </div>
                <div className="flex flex-row border-b border-[var(--separator)] sticky top-20 z-10">
                    {numericDays.map((day, index) => (
                        <p
                            key={`day-${index}`}
                            className="text-[var(--primary)] bg-[var(--light-primary)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                        >
                            {day} {day}
                        </p>
                    ))}
                </div>

                {users.map(() => (
                    <div className="flex flex-row border-b border-[var(--separator)]">
                        {numericDays.map((day, index) => (
                            <p
                                key={`day-${index}`}
                                className="text-[var(--black)] text-sm p-4 min-w-[6rem] text-center border-r border-[var(--separator)]"
                            >
                                OP
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShiftsTable;

export function GetTaskCountTime({ filteredTasks, time, date, variant }) {
    const isSameDay = (dateA, dateB) => {
        const a = new Date(dateA);
        const b = new Date(dateB);

        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
            return false;
        }

        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    };

    const taskCount = () => {
        // If no date provided, only filter by time
        if (!date) {
            return filteredTasks.filter((task) => {
                return task.TIME === time;
            }).length;
        }

        return filteredTasks.filter((task) => {
            return task.TIME === time && isSameDay(task.DATE, date);
        }).length;
    };

    const isToday = variant === "today";

    return (
        <>
            {taskCount() > 0 ? (
                <p
                    className={`text-xs rounded-md px-2 py-1 ${isToday ? "bg-[var(--weekend-cells)] text-[var(--weekend-text)]" : "bg-[var(--light-primary)] text-[var(--primary)]"}`}
                >
                    {taskCount()} task
                </p>
            ) : (
                <p
                    className={`text-xs rounded-md px-2 py-1 ${isToday ? "bg-[var(--weekend-cells)]" : "bg-[var(--light-primary)]"} text-[var(--gray)]`}
                >
                    Nessuna task
                </p>
            )}
        </>
    );
}

export function GetLogbookCountTime({ filteredLogbooks, time, date }) {
    const isSameDay = (dateA, dateB) => {
        const a = new Date(dateA);
        const b = new Date(dateB);

        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
            return false;
        }

        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    };

    const taskCount = () => {
        // If no date provided, only filter by time
        if (!date) {
            return filteredLogbooks.filter((logbook) => {
                return logbook.TIME === time;
            }).length;
        }

        return filteredLogbooks.filter((logbook) => {
            return logbook.TIME === time && isSameDay(logbook.DATE, date);
        }).length;
    };

    return (
        <>
            {taskCount() > 0 ? (
                <p className="text-xs bg-[var(--orange-light)] text-[var(--orange)] rounded-md px-2 py-1">
                    {taskCount()} logbook
                </p>
            ) : (
                <p className="text-xs bg-[var(--light-primary)] text-[var(--gray)] rounded-md px-2 py-1">
                    Nessuna logbook
                </p>
            )}
        </>
    );
}

export function GetTaskCountStatus({ filteredTasks, status }) {
    const taskCount = () => {
        return filteredTasks.filter((task) => {
            return task.STATUS === status;
        }).length;
    };

    const isLogbook =
        filteredTasks.length > 0 && filteredTasks[0]?.ISLOGBOOK === true;

    return (
        <>
            {taskCount() > 0 ? (
                <p
                    className={`text-xs rounded-md px-2 py-1 ${isLogbook ? "bg-[var(--orange-light)] text-[var(--orange)]" : "bg-[var(--light-primary)] text-[var(--primary)]"}`}
                >
                    {taskCount()} {isLogbook ? "entry" : "task"}
                </p>
            ) : (
                <p
                    className={`text-xs rounded-md px-2 py-1 ${isLogbook ? "bg-[var(--orange-light)]" : "bg-[var(--light-primary)]"} text-[var(--gray)]`}
                >
                    {isLogbook ? "Nessuna entry" : "Nessuna task"}
                </p>
            )}
        </>
    );
}

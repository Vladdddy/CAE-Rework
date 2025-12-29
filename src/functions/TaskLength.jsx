export function GetTaskCountTime({ filteredTasks, time, date }) {
    const taskCount = () => {
        // Format date with zero-padding for single-digit months/days
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${date.getFullYear()}-${month}-${day}T00:00:00.000Z`;

        return filteredTasks.filter((task) => {
            return task.TIME === time && task.DATE === formattedDate;
        }).length;
    };

    return (
        <>
            {taskCount() > 0 ? (
                <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                    {taskCount()} task
                </p>
            ) : (
                <p className="text-xs bg-[var(--light-primary)] text-[var(--gray)] rounded-md px-2 py-1">
                    Nessuna task
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

    return (
        <>
            {taskCount() > 0 ? (
                <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                    {taskCount()} task
                </p>
            ) : (
                <p className="text-xs bg-[var(--light-primary)] text-[var(--gray)] rounded-md px-2 py-1">
                    Nessuna task
                </p>
            )}
        </>
    );
}

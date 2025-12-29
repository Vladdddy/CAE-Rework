export function GetTaskCountTime({ filteredTasks, time, date }) {
    const taskCount = () => {
        return filteredTasks.filter((task) => {
            return (
                task.TIME === time &&
                task.DATE ===
                    `${date.getFullYear()}-${
                        date.getMonth() + 1
                    }-${date.getDate()}T00:00:00.000Z`
            );
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

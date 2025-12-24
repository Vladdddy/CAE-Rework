import TaskIcon from "../assets/icons/tasks.tsx";

function Task({ onClick, title, timeOfDay, assignedTo, status }) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer"
        >
            <div className="flex flex-row items-center gap-1 mb-1">
                <TaskIcon className="w-4" />
                <h1 className="text-l font-semibold">{title || "N/A"}</h1>
            </div>
            <p className="text-sm">
                {timeOfDay || "N/A"} • {assignedTo || "N/A"} • {status || "N/A"}
            </p>
        </div>
    );
}

export default Task;

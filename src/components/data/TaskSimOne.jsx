import { useState } from "react";
import ArrowLeftIcon from "../../assets/icons/arrow-left";

const getFieldValue = (task, fieldName) => {
    if (
        !(fieldName in task) ||
        task[fieldName] === null ||
        task[fieldName] === undefined
    ) {
        return "-";
    }

    const value = task[fieldName];

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "string" && value.trim() === "") {
        return "-";
    }

    return String(value);
};

const getDateFieldValue = (task, fieldName) => {
    const value = task[fieldName];
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
};

const TaskSimOne = ({ task }) => {
    const [isOpen, setIsOpen] = useState(false);

    const fields = [
        "ID_task",
        "Scheduled on",
        "LOTO",
        "Performed on",
        "LOTOProcedureID",
        "Task Performed By",
        "Task Done",
        "Tech id",
        "Maintenance Manual Reference",
        "Reference Doc",
    ];

    const simulators = [
        { 1: "109", 2: "FTD", 3: "139#1", 4: "139#3", 5: "169", 6: "189" },
    ];

    const simulatorMap = simulators[0] || {};
    const simulatorId = getFieldValue(task, "ID_sim");
    const simulatorLabel = simulatorMap[simulatorId];

    if (!simulatorLabel) {
        return null;
    }

    return (
        <article
            className="cursor-pointer border border-[var(--light-primary)] rounded-md bg-[var(--pure-white)] p-4"
            onClick={() => setIsOpen((prev) => !prev)}
        >
            <button
                type="button"
                className="w-full flex items-center justify-between gap-2 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex flex-row items-center gap-4 text-md text-[var(--black)] font-medium">
                    <span className="text-sm text-[var(--primary)] bg-[var(--light-primary)] p-1 px-2 rounded">
                        {simulatorLabel}
                    </span>
                    <p>{getFieldValue(task, "Task")}</p>
                </div>

                <div className="flex items-center gap-4">
                    {getFieldValue(task, "Task done") === "Yes" ? (
                        <span className="text-sm text-[var(--green)]">
                            Completato
                        </span>
                    ) : (
                        <span className="text-sm text-[var(--red)]">
                            Non completato
                        </span>
                    )}
                    <ArrowLeftIcon
                        className={`text-[var(--gray)] transition-transform duration-200 w-6 h-6 ${
                            isOpen ? "rotate-90" : "-rotate-90"
                        }`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="mt-3 pt-3 border-t border-[var(--light-primary)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {fields.map((field) => (
                            <div key={field} className="flex gap-2">
                                <span className="text-[var(--gray)] min-w-[11rem]">
                                    {field}:
                                </span>
                                <span className="text-[var(--black)] break-all">
                                    {field === "Scheduled on" ||
                                    field === "Performed on"
                                        ? getDateFieldValue(task, field)
                                        : getFieldValue(task, field)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

export default TaskSimOne;

import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import { GetTableSimulators } from "../../functions/Simulators.jsx";
import {
    GetTaskCountTime,
    GetLogbookCountTime,
} from "../../functions/TaskLength.jsx";
import { useEffect, useState } from "react";

function Table({
    type,
    loading,
    taskList,
    logbookList,
    date,
    onDeleteSuccess,
}) {
    const [localDate, setLocalDate] = useState(date);

    useEffect(() => {
        setLocalDate(date);
    }, [date]);

    // Combine lists for display when type is tasks&logbook
    const combinedList =
        type === "tasks&logbook"
            ? [...(taskList || []), ...(logbookList || [])]
            : taskList;

    return (
        <div className="grid grid-cols-1 gap-16 mt-4">
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <DayIcon className="w-6" />
                        <h1 className="text-md">Giorno</h1>

                        {(type === "tasks" || type === "tasks&logbook") && (
                            <GetTaskCountTime
                                filteredTasks={taskList || []}
                                time="Diurno"
                                date={localDate}
                            />
                        )}

                        {type === "tasks&logbook" && (
                            <GetLogbookCountTime
                                filteredLogbooks={logbookList || []}
                                time="Diurno"
                                date={localDate}
                            />
                        )}
                    </div>

                    <div className="max-h-[calc(80vh-16rem)] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Caricamento...
                            </div>
                        ) : (
                            <GetTableSimulators
                                type={
                                    type === "tasks&logbook"
                                        ? "table&logbook"
                                        : "table"
                                }
                                time="Diurno"
                                date={date}
                                taskList={combinedList}
                                onDeleteSuccess={onDeleteSuccess}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <NightIcon className="w-6" />
                        <h1 className="text-md">Notte</h1>

                        {(type === "tasks" || type === "tasks&logbook") && (
                            <GetTaskCountTime
                                filteredTasks={taskList || []}
                                time="Notturno"
                                date={date}
                            />
                        )}

                        {type === "tasks&logbook" && (
                            <GetLogbookCountTime
                                filteredLogbooks={logbookList || []}
                                time="Notturno"
                                date={localDate}
                            />
                        )}
                    </div>

                    <div className="max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Caricamento...
                            </div>
                        ) : (
                            <GetTableSimulators
                                type={
                                    type === "tasks&logbook"
                                        ? "table&logbook"
                                        : "table"
                                }
                                time="Notturno"
                                date={date}
                                taskList={combinedList}
                                onDeleteSuccess={onDeleteSuccess}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Table;

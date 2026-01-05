import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import { GetTableSimulators } from "../../functions/Simulators.jsx";
import { GetTaskCountTime } from "../../functions/TaskLength.jsx";

function Table({ type, loading, taskList, date, onDeleteSuccess }) {
    return (
        <div className="grid grid-cols-1 gap-16 mt-4">
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <DayIcon className="w-6" />
                        <h1 className="text-md">Giorno</h1>
                        {type === "tasks" ? (
                            <>
                                <GetTaskCountTime
                                    filteredTasks={taskList}
                                    time="Diurno"
                                    date={date}
                                />
                                {/*<span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                    2 logbook
                                </span>*/}
                            </>
                        ) : (
                            <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                2 logbook
                            </span>
                        )}
                    </div>

                    <div className="max-h-[calc(80vh-16rem)] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Caricamento...
                            </div>
                        ) : (
                            <GetTableSimulators
                                type="table"
                                time="Diurno"
                                date={date}
                                taskList={taskList}
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
                        {type === "tasks" ? (
                            <>
                                <GetTaskCountTime
                                    filteredTasks={taskList}
                                    time="Notturno"
                                    date={date}
                                />
                                {/*<span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                    2 logbook
                                </span>*/}
                            </>
                        ) : (
                            <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                2 logbook
                            </span>
                        )}
                    </div>

                    <div className="max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Caricamento...
                            </div>
                        ) : (
                            <GetTableSimulators
                                type="table"
                                time="Notturno"
                                date={date}
                                taskList={taskList}
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

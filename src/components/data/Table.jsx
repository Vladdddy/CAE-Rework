import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import GetSimulators from "../../functions/Simulators.jsx";

function Table({ type }) {
    return (
        <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <DayIcon className="w-6" />
                        <h1 className="text-md">Giorno</h1>
                        {type === "tasks" ? (
                            <>
                                <span className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                                    3 task
                                </span>
                                <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                    2 logbook
                                </span>
                            </>
                        ) : (
                            <span className="text-xs bg-[var(--separator)] text-[var(--gray)] rounded-md px-2 py-1">
                                2 logbook
                            </span>
                        )}
                    </div>

                    <div className="max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        <GetSimulators type="table" bond="Giorno" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[var(--gray)] border-b border-[var(--light-primary)] pb-2">
                        <NightIcon className="w-6" />
                        <h1 className="text-md">Notte</h1>
                    </div>

                    <div className="max-h-[calc(80vh-20rem)] overflow-y-auto pr-1">
                        <GetSimulators type="table" bond="Notte" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Table;

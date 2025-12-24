import React from "react";
import SimulatorIcon from "../../assets/icons/simulator.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";

function SimulatorModal({
    onClose,
    simulatorInfo,
    startTime,
    endTime,
    assignee,
}) {
    const simulators = GetSimulatorsList();

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <SimulatorIcon className="w-6" />
                        {simulatorInfo ? (
                            <h1 className="text-xl">Orari {simulatorInfo}</h1>
                        ) : (
                            <h1 className="text-xl">Orari simulatore</h1>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8 max-h-[calc(80vh-1rem)] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Simulatore
                        </h3>
                        <div className="relative">
                            <select
                                name=""
                                id=""
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                {simulatorInfo ? (
                                    <option value={simulatorInfo}>
                                        {simulatorInfo}
                                    </option>
                                ) : (
                                    <>
                                        {simulators.map((simulator, index) => (
                                            <option
                                                key={index}
                                                value={simulator}
                                            >
                                                {simulator}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Orario inizio
                            </h3>
                            <input
                                type="time"
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={startTime}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Orario fine
                            </h3>
                            <input
                                type="time"
                                className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                value={endTime}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Assegnatario
                        </h3>
                        <div className="relative">
                            <select
                                name=""
                                id=""
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                {assignee ? (
                                    <option value={assignee}>{assignee}</option>
                                ) : (
                                    <>
                                        <option value="">Marco</option>
                                        <option value="">Luca</option>
                                        <option value="">Giovanni</option>
                                    </>
                                )}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                        <button className="btn gray-btn" onClick={onClose}>
                            Chiudi
                        </button>

                        <button className="btn" onClick={onClose}>
                            <p>Salva</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimulatorModal;

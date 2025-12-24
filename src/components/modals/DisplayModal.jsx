import { useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";

function DisplayModal({ taskInfo, onClose }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dettagli");

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
                    <div className="flex flex-row items-center gap-2">
                        <TaskIcon className="w-6" />
                        <h1 className="text-xl">Dettagli Task</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                        <div
                            className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTab === "dettagli"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => setActiveTab("dettagli")}
                        >
                            <p className="text-sm">Dettagli Task</p>
                        </div>

                        <div
                            className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTab === "note"
                                    ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                    : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                            }`}
                            onClick={() => setActiveTab("note")}
                        >
                            <p className="text-sm">Note aggiuntive</p>
                        </div>
                    </div>

                    {activeTab === "dettagli" && (
                        <>
                            <div className="flex flex-col gap-8 max-h-[calc(50vh-1rem)] overflow-y-auto pr-1">
                                <div className="flex flex-col gap-2">
                                    <p className="text-xl text-[var(--black)] font-semibold">
                                        Manutenzione {taskInfo} 139#3
                                    </p>

                                    <p className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        Lorem ipsum dolor sit, amet consectetur
                                        adipisicing elit. Voluptas, fugiat?
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Allegati:
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <div className="flex gap-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md p-2 hover:text-[var(--gray)] cursor-pointer transition-text duration-200">
                                                <div className="w-6 h-6 bg-[var(--light-primary)] rounded-md"></div>
                                                <p>2025-01-23.jpg</p>
                                            </div>

                                            <div className="flex gap-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md p-2 hover:text-[var(--gray)] cursor-pointer transition-text duration-200">
                                                <div className="w-6 h-6 bg-[var(--light-primary)] rounded-md"></div>
                                                <p>2025-01-23.jpg</p>
                                            </div>

                                            <div className="flex gap-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md p-2 hover:text-[var(--gray)] cursor-pointer transition-text duration-200">
                                                <div className="w-6 h-6 bg-[var(--light-primary)] rounded-md"></div>
                                                <p>2025-01-23.jpg</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-start items-start gap-2 border-b border-[var(--light-primary)] pb-4">
                                    <div
                                        className="flex items-center gap-1 text-[var(--black)] hover:text-[var(--primary)] cursor-pointer transition-all duration-200 ease-in-out"
                                        onClick={() =>
                                            setIsDetailsOpen(!isDetailsOpen)
                                        }
                                    >
                                        <h3 className="text-sm">
                                            Mostra Dettagli
                                        </h3>
                                        <ArrowRightIcon
                                            className={`w-4 transition-transform duration-200 ${
                                                isDetailsOpen
                                                    ? "rotate-[-90deg]"
                                                    : "rotate-90"
                                            }`}
                                        />
                                    </div>

                                    <div
                                        className={`${
                                            isDetailsOpen ? "block" : "hidden"
                                        } w-full`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Categoria:
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)]">
                                                            Investigation
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Sotto-Categoria:
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)]">
                                                            SW
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Dettaglio Extra:
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)]">
                                                            SOUND
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Simulatore:
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm text-[var(--black)]">
                                                139#3
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm text-[var(--gray)]">
                                            Assegnato a:
                                        </h3>

                                        <div className="flex items-center gap-2 max-w-xs flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-[var(--black)]">
                                                    Gianluca
                                                </p>
                                            </div>

                                            <span className="text-[var(--separator)] text-md">
                                                •
                                            </span>

                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-[var(--black)]">
                                                    Simone
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm text-[var(--gray)]">
                                            Turno:
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-[var(--black)]">
                                                    Diurno
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm text-[var(--gray)]">
                                            In data:
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-[var(--black)]">
                                                    23/12/2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-1/2">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Stato:
                                    </h3>

                                    <div className="relative">
                                        <select
                                            name=""
                                            id=""
                                            className="p-2 pr-10 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-none focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                        >
                                            <option value="not-started">
                                                Non iniziato
                                            </option>
                                            <option value="in-progress">
                                                In corso
                                            </option>
                                            <option value="completed">
                                                Completato
                                            </option>
                                            <option value="not-completed">
                                                Non completato
                                            </option>
                                            <option value="undefined">
                                                Da definire
                                            </option>
                                        </select>
                                        <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[var(--light-primary)] pt-4 mt-4">
                                <button className="btn delete">Elimina</button>

                                <div className="flex gap-1">
                                    <button
                                        className="btn gray-btn"
                                        onClick={onClose}
                                    >
                                        Chiudi
                                    </button>
                                    <button className="btn flex items-center gap-1">
                                        <p>Modifica</p>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "note" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-8 max-h-[calc(40vh-4rem)] overflow-y-auto pr-1">
                                <div className="flex justify-between gap-4">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Simone:
                                    </h3>
                                    <p className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        Lorem ipsum dolor sit, amet consectetur
                                        adipisicing elit. Necessitatibus
                                        delectus harum odit iusto ab in tempore
                                        laudantium dolorem, facere tempora.
                                        <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                            17/12/2025 • 18:19
                                        </span>
                                    </p>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Mario:
                                    </h3>
                                    <p className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        Lorem ipsum dolor sit, amet consectetur
                                        adipisicing elit.
                                        <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                            17/12/2025 • 17:31
                                        </span>
                                    </p>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Marco:
                                    </h3>
                                    <p className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        Lorem ipsum dolor sit, amet consectetur
                                        adipisicing elit.
                                        <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                            15/12/2025 • 11:25
                                        </span>
                                    </p>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Gianluca:
                                    </h3>
                                    <p className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        Lorem ipsum dolor sit, amet consectetur
                                        adipisicing elit. Lorem ipsum dolor sit,
                                        amet consectetur adipisicing elit. Lorem
                                        ipsum dolor sit, amet consectetur
                                        adipisicing elit.
                                        <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                            11/12/2025 • 9:39
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-[var(--light-primary)] pt-4">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Note aggiuntive:
                                </h3>
                                <textarea
                                    className="w-full min-h-[100px] p-3 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] resize-y focus:outline-none focus:border-[var(--separator)] transition-all duration-200"
                                    placeholder="Inserisci note aggiuntive qui..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                                <button
                                    className="btn gray-btn"
                                    onClick={onClose}
                                >
                                    Chiudi
                                </button>

                                <button className="btn">
                                    <p>Salva nota</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DisplayModal;

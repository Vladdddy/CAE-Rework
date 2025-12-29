import React from "react";
import SearchIcon from "../../assets/icons/search.tsx";
import ArrowIcon from "../../assets/icons/arrow-left.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";

function SearchModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 pt-16"
            onClick={onClose}
        >
            <div
                className="max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="bg-[var(--bento-bg)] p-2 rounded-md hover:bg-[var(--light-primary)] transition text-[var(--gray)] border border-[var(--light-primary)]"
                    >
                        <ArrowIcon className="w-6" />
                    </button>
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                        <input
                            type="search"
                            placeholder="Cerca task"
                            className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                        />
                    </div>
                </div>
                <div className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full shadow-xl border border-[var(--light-primary)] mt-4">
                    <div className="flex items-center justify-start gap-2 border-b border-[var(--light-primary)] pb-2 mb-4">
                        <h1 className="text-md text-[var(--gray)]">
                            Risultato
                        </h1>
                        <p className="text-xs bg-[var(--light-primary)] text-[var(--primary)] rounded-md px-2 py-1">
                            271 task
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer text-[var(--black)]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                                <TaskIcon className="w-4" />
                                <h1 className="text-l font-semibold">
                                    {"N/A"}
                                </h1>
                            </div>
                            <p className="text-sm">
                                {"N/A"} • {"N/A"} • {"N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchModal;

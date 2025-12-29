import React, { useState, useMemo, useRef, useEffect } from "react";
import SearchIcon from "../../assets/icons/search.tsx";
import ArrowIcon from "../../assets/icons/arrow-left.tsx";
import Task from "../data/Task.jsx";
import { useTasks } from "../data/provider/useTasks";

function SearchModal({ onClose }) {
    const { tasks, loading } = useTasks();
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;

        const query = searchQuery.toLowerCase();

        return tasks.filter(
            (task) =>
                task.TITLE?.toLowerCase().includes(query) ||
                task.DESCRIPTION?.toLowerCase().includes(query) ||
                task.ASSIGNED_TO?.toLowerCase().includes(query) ||
                task.STATUS?.toLowerCase().includes(query)
        );
    }, [tasks, searchQuery]);

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
                            ref={inputRef}
                            type="search"
                            placeholder="Cerca task"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            {filteredTasks.length} task
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Caricamento...
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-center text-sm text-[var(--gray)] py-4">
                                Nessuna task trovata
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <Task
                                    key={task.id}
                                    title={task?.TITLE}
                                    date={formatDate(task?.DATE)}
                                    assignedTo={task?.ASSIGNED_TO}
                                    status={task?.STATUS}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchModal;

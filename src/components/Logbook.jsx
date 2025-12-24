import React from "react";
import LogbookIcon from "../assets/icons/logbook.tsx";

function LogBook({ onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-start justify-between p-2 border border-[var(--light-primary)] rounded-md bg-[var(--separator)] hover:bg-[var(--light-primary)] hover:border-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200 ease-in-out cursor-pointer"
        >
            <div className="flex flex-row items-center gap-1 mb-1">
                <LogbookIcon className="w-4" />
                <h1 className="text-l font-semibold">Logbook</h1>
            </div>
            <p className="text-sm">Diurno • Gianluca • Non iniziato</p>
        </div>
    );
}

export default LogBook;

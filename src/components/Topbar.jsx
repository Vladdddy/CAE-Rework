import React from "react";
import SidebarIcon from "../assets/icons/sidebar.tsx";
import SearchIcon from "../assets/icons/search.tsx";
import CurrentTime from "../functions/CurrentTime.jsx";
import AddIcon from "../assets/icons/add.tsx";

function Topbar({ isSidebarOpen, setSidebarStatus }) {
    return (
        <div className="bg-[var(--bento-bg)] text-[var(--black)] w-full h-auto p-4 flex items-center justify-between border-b border-[var(--light-primary)]">
            <div className="flex items-center justify-start gap-4">
                <SidebarIcon
                    className="w-6 cursor-pointer icon"
                    onClick={() => setSidebarStatus(!isSidebarOpen)}
                />
                <h1 className="border-x border-[var(--separator)] px-4 text-l">
                    Benvenuto, Gianluca!
                </h1>
                <div className="relative w-[30vw]">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--separator)]" />
                    <input
                        type="search"
                        placeholder="Cerca task"
                        className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[#ffffff] w-full text-md placeholder:text-[var(--separator)] focus:outline-none focus:border-[var(--separator)]"
                    />
                </div>
                <button className="btn flex gap-2 items-center">
                    <AddIcon className="w-6" />
                    <p>Programma task</p>
                </button>
            </div>
            <CurrentTime />
        </div>
    );
}

export default Topbar;

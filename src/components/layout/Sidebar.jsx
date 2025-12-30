import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/cae-logo.png";
import DashboardIcon from "../../assets/icons/dashboard.tsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";
import ShiftsIcon from "../../assets/icons/shifts.tsx";
import LogoutIcon from "../../assets/icons/logout.tsx";
import LogoutModal from "../modals/LogoutModal.jsx";

function Sidebar(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <nav
            className={`flex flex-col items-center justify-between bg-[var(--bento-bg)] h-screen p-4 border-r border-[var(--light-primary)] transition-all duration-300 ${
                props.isSidebarOpen ? "" : "items-center"
            }`}
        >
            <div className="flex flex-col items-center gap-16">
                <img
                    className={`${
                        !props.isSidebarOpen ? "w-12" : "w-20"
                    } mx-auto mt-4 transition-all duration-300`}
                    src={Logo}
                    alt="Logo"
                />

                <div
                    className={`flex flex-col gap-2 text-l text-[var(--black)] transition-all duration-300`}
                >
                    <Link
                        to="/dashboard"
                        className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                            props.active === "dashboard"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                      !props.isSidebarOpen
                                          ? "p-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "justify-center" : ""}`}
                    >
                        <DashboardIcon className="w-6" />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Dashboard
                        </p>
                    </Link>
                    <Link
                        to="/tasks"
                        className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                            props.active === "tasks"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                    >
                        <TasksIcon className="w-6 " />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Tasks
                        </p>
                    </Link>
                    <Link
                        to="/logbook"
                        className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                            props.active === "logbook"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                    >
                        <LogbookIcon className="w-6" />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Logbook
                        </p>
                    </Link>
                    <Link
                        to="/shifts"
                        className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                            props.active === "shifts"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                    >
                        <ShiftsIcon className={`w-6`} />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Shifts
                        </p>
                    </Link>
                </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-2 border-t border-[var(--separator)] pt-4 w-full">
                <div
                    className={`flex flex-row items-center gap-2 transition-opacity duration-300 ${
                        props.isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
                    }`}
                >
                    <div className="flex items-center justify-center text-[var(--primary)] text-xl w-10 h-10 bg-[var(--light-primary)] rounded-full">
                        G
                    </div>
                    <div className="flex flex-col gap-0">
                        <p className="text-sm text-[var(--black)]">Gianluca</p>
                        <p className="text-xs text-[var(--gray)]">Admin</p>
                    </div>
                </div>

                <div
                    className={`text-[var(--red)] flex items-center justify-center transition-all duration-300 cursor-pointer hover:text-[var(--gray)] ${
                        !props.isSidebarOpen ? "mx-auto" : ""
                    }`}
                >
                    <LogoutIcon className="w-6" onClick={handleLogoutClick} />
                </div>
            </div>

            {isModalOpen && <LogoutModal onClose={handleCloseModal} />}
        </nav>
    );
}

export default Sidebar;

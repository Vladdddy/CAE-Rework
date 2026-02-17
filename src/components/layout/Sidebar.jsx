import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../data/provider/userAPI/useUsers";
import Logo from "../../assets/cae-logo.png";
import DashboardIcon from "../../assets/icons/dashboard.tsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";
import ShiftsIcon from "../../assets/icons/shifts.tsx";
import AddUserIcon from "../../assets/icons/addUser.tsx";
import LogoutIcon from "../../assets/icons/logout.tsx";
import ReportIcon from "../../assets/icons/report.tsx";
import LogoutModal from "../modals/LogoutModal.jsx";
import SettingsIcon from "../../assets/icons/settings.tsx";
import CloseIcon from "../../assets/icons/close.tsx";

function Sidebar(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUsername, currentUserRole } = useUsers();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showContrast, setShowContrast] = useState(() => {
        const saved = localStorage.getItem("showContrast");
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem("showContrast", JSON.stringify(showContrast));
        window.dispatchEvent(
            new CustomEvent("contrastChange", { detail: showContrast }),
        );
    }, [showContrast]);

    const handleLogoutClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleContrastChange = (e) => {
        setShowContrast(e.target.checked);
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
                    {props.isSidebarOpen ? (
                        <p className="text-sm text-[var(--gray)] mt-4">Menu</p>
                    ) : null}
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
                    {(currentUserRole === "Admin" ||
                        currentUserRole === "Shift Leader") && (
                        <>
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
                        </>
                    )}

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
                    {props.isSidebarOpen ? (
                        <p className="text-sm text-[var(--gray)] mt-4">Altro</p>
                    ) : null}
                    {(currentUserRole === "Admin" ||
                        currentUserRole === "Shift Leader") && (
                        <>
                            <Link
                                to="/register"
                                className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                                    props.active === "register"
                                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                              !props.isSidebarOpen
                                                  ? "px-2"
                                                  : "pr-8 pl-2 w-48"
                                          } py-2`
                                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                } ${
                                    !props.isSidebarOpen
                                        ? "p-2 justify-center"
                                        : ""
                                }`}
                            >
                                <AddUserIcon className={`w-6`} />
                                <p
                                    className={`transition-opacity duration-300 ${
                                        props.isSidebarOpen
                                            ? "opacity-100"
                                            : "opacity-0 hidden"
                                    }`}
                                >
                                    Aggiungi Utente
                                </p>
                            </Link>
                        </>
                    )}
                    <Link
                        to="mailto:bukatorvladyslav@gmail.com?subject=Segnalazione%20bug%20CAE"
                        className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                            props.active === "report"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                    >
                        <ReportIcon className="w-6" />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Segnala Bug
                        </p>
                    </Link>
                </div>
            </div>

            <div
                className={`flex flex-row items-center gap-2 w-full transition-all text-l text-[var(--black)] duration-300 mt-auto mb-4 cursor-pointer relative ${
                    props.active === "settings"
                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md ${
                              !props.isSidebarOpen ? "px-2" : "pr-8 pl-2 w-48"
                          } py-2`
                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                onClick={() => setShowExportMenu(!showExportMenu)}
            >
                <SettingsIcon className={`w-6`} />
                <p
                    className={`transition-opacity duration-300 ${
                        props.isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
                    }`}
                >
                    Impostazioni
                </p>
            </div>

            {showExportMenu && (
                <div className="absolute left-4 right-4 bottom-32 w-48 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                    <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--light-primary)]">
                        <span className="text-sm font-medium">
                            Impostazioni
                        </span>
                        <button
                            onClick={() => setShowExportMenu(false)}
                            className="hover:bg-[var(--light-primary)] rounded transition-colors duration-200"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <label className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showContrast}
                            onChange={handleContrastChange}
                            className="w-4 h-4 appearance-none border border-[var(--pure-white)] bg-[var(--light-primary)] rounded cursor-pointer checked:bg-[var(--primary)] checked:border-[var(--primary)] relative checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                        />
                        <span>Mostra contrasto</span>
                    </label>
                </div>
            )}

            <div className="flex flex-row items-center justify-between gap-2 border-t border-[var(--separator)] pt-4 w-full">
                <div
                    className={`flex flex-row items-center gap-2 transition-opacity duration-300 ${
                        props.isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
                    }`}
                >
                    <div className="flex items-center justify-center text-[var(--primary)] text-xl w-10 h-10 bg-[var(--light-primary)] rounded-full">
                        {currentUsername
                            ? currentUsername.charAt(0).toUpperCase()
                            : "?"}
                    </div>
                    <div className="flex flex-col gap-0">
                        <p className="text-sm text-[var(--black)]">
                            {currentUsername
                                .split(".")[0]
                                .charAt(0)
                                .toUpperCase() +
                                currentUsername.split(".")[0].slice(1)}
                        </p>
                        <p className="text-xs text-[var(--gray)]">
                            {currentUserRole}
                        </p>
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

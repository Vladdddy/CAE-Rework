import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../data/provider/userAPI/useUsers";
import Logo from "../../assets/cae-logo.png";
import DashboardIcon from "../../assets/icons/dashboard.tsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";
import ShiftsIcon from "../../assets/icons/shifts.tsx";
import SimulatorIcon from "../../assets/icons/simulator.tsx";
import AddUserIcon from "../../assets/icons/addUser.tsx";
import LogoutIcon from "../../assets/icons/logout.tsx";
import ReportIcon from "../../assets/icons/report.tsx";
import LogoutModal from "../modals/LogoutModal.jsx";
import SettingsIcon from "../../assets/icons/settings.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import UpdateIcon from "../../assets/icons/update.tsx";
import AccessibilityIcon from "../../assets/icons/accessibility.tsx";
import Update from "./Update.jsx";

function Sidebar({ isMobileOpen = false, onMobileClose = () => {}, ...props }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUsername, currentUserRole } = useUsers();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showContrast, setShowContrast] = useState(() => {
        const saved = localStorage.getItem("showContrast");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [showUpdates, setShowUpdates] = useState(false);

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
        <>
            <nav
                className={`hidden md:flex flex-col items-center justify-between bg-[var(--bento-bg)] h-screen p-4 border-r border-[var(--light-primary)] transition-all duration-300 ${
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
                            <p className="text-sm text-[var(--gray)] mt-4">
                                Menu
                            </p>
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
                        <Link
                            to="/training-load"
                            className={`flex flex-row items-center gap-2 transition-all duration-300 ${
                                props.active === "training-load"
                                    ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                          !props.isSidebarOpen
                                              ? "px-2"
                                              : "pr-8 pl-2 w-48"
                                      } py-2`
                                    : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                            } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                        >
                            <SimulatorIcon className={`w-6`} />
                            <p
                                className={`transition-opacity duration-300 ${
                                    props.isSidebarOpen
                                        ? "opacity-100"
                                        : "opacity-0 hidden"
                                }`}
                            >
                                Training Load
                            </p>
                        </Link>
                        {props.isSidebarOpen ? (
                            <p className="text-sm text-[var(--gray)] mt-4">
                                Altro
                            </p>
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
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 w-full mt-auto mb-4">
                    <div
                        className={`flex flex-row items-center gap-2 w-full transition-all text-l text-[var(--black)] duration-300 cursor-pointer relative ${
                            props.active === "settings"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                        onClick={() => {
                            setShowUpdates(!showUpdates);
                            setShowContrast(false);
                        }}
                    >
                        <UpdateIcon className={`w-6`} />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Aggiornamenti
                        </p>
                    </div>

                    <div
                        className={`flex flex-row items-center gap-2 w-full transition-all text-l text-[var(--black)] duration-300 mt-auto mb-4 cursor-pointer relative ${
                            props.active === "settings"
                                ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md ${
                                      !props.isSidebarOpen
                                          ? "px-2"
                                          : "pr-8 pl-2 w-48"
                                  } py-2`
                                : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                        } ${!props.isSidebarOpen ? "p-2 justify-center" : ""}`}
                        onClick={() => {
                            setShowExportMenu(!showExportMenu);
                            setShowUpdates(false);
                        }}
                    >
                        <AccessibilityIcon className={`w-6`} />
                        <p
                            className={`transition-opacity duration-300 ${
                                props.isSidebarOpen
                                    ? "opacity-100"
                                    : "opacity-0 hidden"
                            }`}
                        >
                            Accessibilità
                        </p>
                    </div>
                </div>

                {showExportMenu && (
                    <div className="absolute left-4 right-4 bottom-32 w-64 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--light-primary)] mb-2">
                            <span className="text-lg font-medium">
                                Gestisci
                            </span>
                            <button
                                onClick={() => setShowExportMenu(false)}
                                className="hover:bg-[var(--light-primary)] rounded transition-colors duration-200"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <span className="px-4 py-4 text-sm text-[var(--gray)] mt-4">
                            Opzioni
                        </span>
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

                {showUpdates && (
                    <div className="absolute left-4 right-4 bottom-48 w-96 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--light-primary)] mb-2">
                            <span className="text-lg font-medium">
                                Aggiornamenti
                            </span>
                            <button
                                onClick={() => setShowUpdates(false)}
                                className="hover:bg-[var(--light-primary)] rounded transition-colors duration-200"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 mt-2 p-2 max-h-80 overflow-y-auto">
                            <Update
                                title="Unique Dashboard 13.04.26"
                                text="Implementata una dashboard unica che integra tutte le applicazioni della CAE."
                                date="13/04/2026 - 11:47"
                            />
                            <Update
                                title="PM Plan Tasks 7.04.26"
                                text="Aggiunte le PM task nella tabella dei task (quelle con il colore viola)"
                                date="7/04/2026 - 14:29"
                            />
                            <Update
                                title="Mobile Version 2.04.26"
                                text="Rilasciata la versione mobile dell'applicazione, con un design responsive e tutte le funzionalità principali accessibili da smartphone."
                                date="2/04/2026 - 14:30"
                            />
                            <Update
                                title="Training Load PDF 1.04.26"
                                text="Aggiunta l'esportazione del Training Load in PDF, con un layout chiaro e professionale che include tutte le informazioni essenziali."
                                date="1/04/2026 - 15:12"
                            />
                            <Update
                                title="Task & Entry Fixes 1.04.26"
                                text="Ora le task e le entry a cui vengono apportate delle modifiche prima delle ore 8:00 restano nel turno del giorno di ieri."
                                date="1/04/2026 - 10:22"
                            />
                            <Update
                                title="Bug Fixes 1.04.26"
                                text="Risolto il problema dell'Export PDF che non mostra più le task rischedulate. Inoltre sistemato il problema del display dei simulatori che venivano mostrati nel giorno sbagliato."
                                date="1/04/2026 - 10:03"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-row items-center justify-between gap-2 border-t border-[var(--separator)] pt-4 w-full">
                    <div
                        className={`flex flex-row items-center gap-2 transition-opacity duration-300 ${
                            props.isSidebarOpen
                                ? "opacity-100"
                                : "opacity-0 hidden"
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
                        <LogoutIcon
                            className="w-6"
                            onClick={handleLogoutClick}
                        />
                    </div>
                </div>

                {isModalOpen && <LogoutModal onClose={handleCloseModal} />}
            </nav>

            <div
                className={`md:hidden fixed inset-0 z-[70] transition-opacity duration-300 ${
                    isMobileOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                <button
                    type="button"
                    className="absolute inset-0 bg-black/40"
                    onClick={onMobileClose}
                    aria-label="Chiudi menu mobile"
                />

                <nav className="relative w-[85vw] max-w-[320px] h-screen h-full bg-[var(--bento-bg)] border-r border-[var(--light-primary)] p-6 flex flex-col justify-between">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <img className="w-16" src={Logo} alt="Logo" />
                            <button
                                onClick={onMobileClose}
                                className="p-1 rounded hover:bg-[var(--light-primary)]"
                            >
                                <CloseIcon className="w-6 h-6 text-[var(--black)]" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 text-l text-[var(--black)]">
                            <Link
                                to="/dashboard"
                                onClick={onMobileClose}
                                className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                    props.active === "dashboard"
                                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                              !props.isSidebarOpen
                                                  ? "p-3"
                                                  : "pr-8 pl-3 w-48"
                                          } py-3`
                                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                }`}
                            >
                                <DashboardIcon className="w-6" />
                                Dashboard
                            </Link>

                            {(currentUserRole === "Admin" ||
                                currentUserRole === "Shift Leader") && (
                                <Link
                                    to="/tasks"
                                    className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                        props.active === "tasks"
                                            ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                                  !props.isSidebarOpen
                                                      ? "p-3"
                                                      : "pr-8 pl-3 w-48"
                                              } py-3`
                                            : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                    }`}
                                    onClick={onMobileClose}
                                >
                                    <TasksIcon className="w-6" />
                                    Tasks
                                </Link>
                            )}
                            <Link
                                to="/logbook"
                                className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                    props.active === "logbook"
                                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                              !props.isSidebarOpen
                                                  ? "p-3"
                                                  : "pr-8 pl-3 w-48"
                                          } py-3`
                                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                }`}
                                onClick={onMobileClose}
                            >
                                <LogbookIcon className="w-6" />
                                Logbook
                            </Link>
                            <Link
                                to="/shifts"
                                className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                    props.active === "shifts"
                                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                              !props.isSidebarOpen
                                                  ? "p-3"
                                                  : "pr-8 pl-3 w-48"
                                          } py-3`
                                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                }`}
                                onClick={onMobileClose}
                            >
                                <ShiftsIcon className="w-6" />
                                Shifts
                            </Link>
                            <Link
                                to="/training-load"
                                className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                    props.active === "training-load"
                                        ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                              !props.isSidebarOpen
                                                  ? "p-3"
                                                  : "pr-8 pl-3 w-48"
                                          } py-3`
                                        : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                }`}
                                onClick={onMobileClose}
                            >
                                <SimulatorIcon className="w-6" />
                                Training Load
                            </Link>
                            {(currentUserRole === "Admin" ||
                                currentUserRole === "Shift Leader") && (
                                <Link
                                    to="/register"
                                    className={`flex w-full flex-row items-center gap-2 transition-all duration-300 ${
                                        props.active === "register"
                                            ? `text-[var(--primary)] bg-[var(--light-primary)] rounded-md  ${
                                                  !props.isSidebarOpen
                                                      ? "p-3"
                                                      : "pr-8 pl-3 w-48"
                                              } py-3`
                                            : "p-2 hover:bg-[var(--light-primary)] rounded-md"
                                    }`}
                                    onClick={onMobileClose}
                                >
                                    <AddUserIcon className="w-6" />
                                    Aggiungi Utente
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-[var(--separator)] pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center text-[var(--primary)] text-xl w-10 h-10 bg-[var(--light-primary)] rounded-full">
                                {currentUsername
                                    ? currentUsername.charAt(0).toUpperCase()
                                    : "?"}
                            </div>
                            <div>
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
                        <button
                            onClick={handleLogoutClick}
                            className="text-[var(--red)] hover:text-[var(--gray)]"
                        >
                            <LogoutIcon className="w-6" />
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}

export default Sidebar;

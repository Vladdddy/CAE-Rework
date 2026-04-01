import React, { useState, useEffect } from "react";
import SidebarIcon from "../../assets/icons/sidebar.tsx";
import SearchIcon from "../../assets/icons/search.tsx";
import CurrentTime from "../../functions/CurrentTime.jsx";
import AddIcon from "../../assets/icons/add.tsx";
import BellIcon from "../../assets/icons/bell.tsx";
import CreateModal from "../modals/CreateModal.jsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import SearchModal from "../modals/SearchModal.jsx";
import Popup from "../modals/Popup.jsx";
import Notifications from "../modals/Notifications.jsx";
import { useTasks } from "../data/provider/taskAPI/useTasks";
import { useUsers } from "../data/provider/userAPI/useUsers";
import { useEmployeeMessages } from "../data/provider/employeeMessageAPI/useEmployeeMessages";

function Topbar({ isSidebarOpen, setSidebarStatus, setMobileSidebarOpen }) {
    const { fetchTasks } = useTasks();
    const { fetchUnreadCount, unreadCount } = useEmployeeMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [notificationsModal, setNotificationsModal] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const { currentUsername, currentUserRole, currentUserId } = useUsers();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (currentUserId) {
            fetchUnreadCount(currentUserId);

            const interval = setInterval(() => {
                fetchUnreadCount(currentUserId);
            }, 30000); // Check every 30 seconds

            return () => clearInterval(interval);
        }
    }, [currentUserId, fetchUnreadCount]);

    const handleTaskClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
        }
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Hai creato la task con successo"
                    : "Errore durante la creazione della task"),
        );
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    const handleSearchOpen = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
        document.body.classList.toggle("dark-mode");
    };

    const handleSidebarToggle = () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
            setMobileSidebarOpen?.(true);
            return;
        }

        setSidebarStatus(!isSidebarOpen);
    };

    return (
        <div className="bg-[var(--bento-bg)] text-[var(--black)] w-full h-auto p-3 md:p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[var(--light-primary)]">
            <div className="flex items-center justify-start gap-4 min-w-0">
                <SidebarIcon
                    className="w-6 cursor-pointer icon"
                    onClick={handleSidebarToggle}
                />

                <div
                    className="relative w-[30vw] hidden md:block"
                    onClick={() => handleSearchOpen()}
                >
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                    <input
                        type="search"
                        placeholder="Cerca per titolo, stato, tecnico ecc..."
                        readOnly
                        onFocus={(e) => e.target.blur()}
                        className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                    />
                </div>
                {(currentUserRole === "Admin" ||
                    currentUserRole === "Shift Leader") && (
                    <>
                        <button
                            className="btn flex gap-2 items-center px-3 md:px-4"
                            onClick={handleTaskClick}
                        >
                            <AddIcon className="w-6" />
                            <p className="hidden lg:block truncate">
                                Programma task
                            </p>
                        </button>
                    </>
                )}
                <div className="flex items-center justify-center gap-1 ml-auto md:ml-0">
                    <div
                        className="relative"
                        onClick={() => setNotificationsModal(true)}
                    >
                        <BellIcon className="w-6 cursor-pointer icon" />
                        {unreadCount > 0 && (
                            <span className="red-circle w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0"></span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <p className="hidden lg:block ml-2 text-xs text-white bg-red-500 rounded-full px-4 py-2">
                            Hai {unreadCount} notifiche
                        </p>
                    )}
                </div>
            </div>

            <div
                className="relative w-full md:hidden mt-2 mb-4"
                onClick={() => handleSearchOpen()}
            >
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                <input
                    type="search"
                    placeholder="Cerca per titolo, stato, tecnico ecc..."
                    readOnly
                    onFocus={(e) => e.target.blur()}
                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                />
            </div>

            {isDarkMode ? (
                <div
                    className="hidden md:flex gap-2 items-center border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md p-2 px-3 md:px-4 cursor-pointer ml-auto md:mr-4"
                    onClick={toggleDarkMode}
                >
                    <DayIcon className="w-6" />
                    <p className="hidden lg:block truncate">Tema chiaro</p>
                </div>
            ) : (
                <div
                    className="hidden md:flex gap-2 items-center border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md p-2 px-3 md:px-4 cursor-pointer ml-auto md:mr-4"
                    onClick={toggleDarkMode}
                >
                    <NightIcon className="w-6" />
                    <p className="hidden lg:block truncate">Tema scuro</p>
                </div>
            )}
            <div className="hidden lg:block">
                <CurrentTime />
            </div>

            {isModalOpen && (
                <CreateModal
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                    type="task"
                />
            )}

            {isSearchOpen && (
                <SearchModal
                    onClose={handleCloseSearch}
                    onDeleteSuccess={handleSuccess}
                />
            )}

            {showPopup && <Popup type={popupType} message={popupMessage} />}

            {notificationsModal && (
                <Notifications onClose={() => setNotificationsModal(false)} />
            )}
        </div>
    );
}

export default Topbar;

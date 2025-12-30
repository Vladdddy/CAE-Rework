import React, { useState, useEffect } from "react";
import SidebarIcon from "../../assets/icons/sidebar.tsx";
import SearchIcon from "../../assets/icons/search.tsx";
import CurrentTime from "../../functions/CurrentTime.jsx";
import AddIcon from "../../assets/icons/add.tsx";
import CreateModal from "../modals/CreateModal.jsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import SearchModal from "../modals/SearchModal.jsx";
import Popup from "../modals/Popup.jsx";
import { useTasks } from "../data/provider/taskAPI/useTasks";
import { useUsers } from "../data/provider/userAPI/useUsers";

function Topbar({ isSidebarOpen, setSidebarStatus }) {
    const { fetchTasks } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const { currentUsername } = useUsers();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

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
                    : "Errore durante la creazione della task")
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

    return (
        <div className="bg-[var(--bento-bg)] text-[var(--black)] w-full h-auto p-4 flex items-center justify-between border-b border-[var(--light-primary)]">
            <div className="flex items-center justify-start gap-4">
                <SidebarIcon
                    className="w-6 cursor-pointer icon"
                    onClick={() => setSidebarStatus(!isSidebarOpen)}
                />
                <h1 className="border-x border-[var(--light-primary)] px-4 text-l">
                    Benvenuto,{" "}
                    {currentUsername.split(".")[0].charAt(0).toUpperCase() +
                        currentUsername.split(".")[0].slice(1)}
                    !
                </h1>
                <div
                    className="relative w-[30vw]"
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
                <button
                    className="btn flex gap-2 items-center"
                    onClick={handleTaskClick}
                >
                    <AddIcon className="w-6" />
                    <p className="">Programma task</p>
                </button>
            </div>
            {isDarkMode ? (
                <DayIcon
                    className="w-6 text-[var(--black)] cursor-pointer hover:text-[var(--gray)] ml-auto mr-4"
                    onClick={toggleDarkMode}
                />
            ) : (
                <NightIcon
                    className="w-6 text-[var(--black)] cursor-pointer hover:text-[var(--gray)] ml-auto mr-4"
                    onClick={toggleDarkMode}
                />
            )}
            <CurrentTime />

            {isModalOpen && (
                <CreateModal
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}

            {isSearchOpen && <SearchModal onClose={handleCloseSearch} />}

            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </div>
    );
}

export default Topbar;

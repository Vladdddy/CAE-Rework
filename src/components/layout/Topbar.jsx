import React, { useState, useEffect, useRef } from "react";
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
import ShiftsIcon from "../../assets/icons/shifts.tsx";

const TIMER_DURATION_SECONDS = 10 * 60;
const SHIFTS_TIMER_END_KEY = "shiftsTimerEndAt";
const SHIFTS_TIMER_POSITION_KEY = "shiftsTimerPosition";

const getStoredTimerEndAt = () => {
    const storedEndAt = Number(localStorage.getItem(SHIFTS_TIMER_END_KEY));
    if (!Number.isFinite(storedEndAt) || storedEndAt <= Date.now()) {
        localStorage.removeItem(SHIFTS_TIMER_END_KEY);
        return null;
    }
    return storedEndAt;
};

const getStoredTimerPosition = () => {
    const storedPosition = localStorage.getItem(SHIFTS_TIMER_POSITION_KEY);
    if (!storedPosition) return null;

    try {
        const parsedPosition = JSON.parse(storedPosition);
        const isValidPosition =
            typeof parsedPosition?.x === "number" &&
            typeof parsedPosition?.y === "number";
        return isValidPosition ? parsedPosition : null;
    } catch {
        return null;
    }
};

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
    const { currentUserRole, currentUserId } = useUsers();

    // Timer state
    const [timerEndAt, setTimerEndAt] = useState(() => getStoredTimerEndAt());
    const [timerActive, setTimerActive] = useState(() =>
        Boolean(getStoredTimerEndAt()),
    );
    const [timeLeft, setTimeLeft] = useState(() => {
        const storedEndAt = getStoredTimerEndAt();
        if (!storedEndAt) return TIMER_DURATION_SECONDS;
        return Math.ceil((storedEndAt - Date.now()) / 1000);
    });
    const [timerPosition, setTimerPosition] = useState(() =>
        getStoredTimerPosition(),
    );
    const [isDraggingTimer, setIsDraggingTimer] = useState(false);
    const timerRef = useRef(null);
    const timerWidgetRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (currentUserId) {
            fetchUnreadCount(currentUserId);
            const interval = setInterval(() => {
                fetchUnreadCount(currentUserId);
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUserId, fetchUnreadCount]);

    // Timer countdown effect
    useEffect(() => {
        if (!timerActive || !timerEndAt) return;

        const updateTimeLeft = () => {
            const remainingSeconds = Math.max(
                0,
                Math.ceil((timerEndAt - Date.now()) / 1000),
            );
            setTimeLeft(remainingSeconds);

            if (remainingSeconds <= 0) {
                clearInterval(timerRef.current);
                setTimerActive(false);
                setTimerEndAt(null);
                localStorage.removeItem(SHIFTS_TIMER_END_KEY);
            }
        };

        updateTimeLeft();
        timerRef.current = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(timerRef.current);
    }, [timerActive, timerEndAt]);

    const handleShiftsClick = () => {
        if (timerActive) {
            // Toggle off: reset timer
            clearInterval(timerRef.current);
            setTimerActive(false);
            setTimerEndAt(null);
            setTimeLeft(TIMER_DURATION_SECONDS);
            localStorage.removeItem(SHIFTS_TIMER_END_KEY);
        } else {
            const endAt = Date.now() + TIMER_DURATION_SECONDS * 1000;
            setTimerEndAt(endAt);
            setTimeLeft(TIMER_DURATION_SECONDS);
            setTimerActive(true);
            localStorage.setItem(SHIFTS_TIMER_END_KEY, String(endAt));
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleTaskClick = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSuccess = async (isSuccess, message) => {
        if (isSuccess) await fetchTasks();
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Hai creato la task con successo"
                    : "Errore durante la creazione della task"),
        );
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
    };

    const handleSearchOpen = () => setIsSearchOpen(true);
    const handleCloseSearch = () => setIsSearchOpen(false);

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

    const clampTimerPosition = (x, y) => {
        const widgetWidth = timerWidgetRef.current?.offsetWidth ?? 160;
        const widgetHeight = timerWidgetRef.current?.offsetHeight ?? 160;
        const maxX = Math.max(0, window.innerWidth - widgetWidth);
        const maxY = Math.max(0, window.innerHeight - widgetHeight);

        return {
            x: Math.min(Math.max(0, x), maxX),
            y: Math.min(Math.max(0, y), maxY),
        };
    };

    const persistTimerPosition = (position) => {
        localStorage.setItem(
            SHIFTS_TIMER_POSITION_KEY,
            JSON.stringify(position),
        );
    };

    const startTimerDrag = (clientX, clientY) => {
        if (!timerWidgetRef.current) return;

        const rect = timerWidgetRef.current.getBoundingClientRect();
        dragOffsetRef.current = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };

        const fixedPosition = { x: rect.left, y: rect.top };
        setTimerPosition(fixedPosition);
        persistTimerPosition(fixedPosition);
        setIsDraggingTimer(true);
    };

    useEffect(() => {
        if (!isDraggingTimer) return;

        const handleDragMove = (clientX, clientY) => {
            const nextX = clientX - dragOffsetRef.current.x;
            const nextY = clientY - dragOffsetRef.current.y;
            const clampedPosition = clampTimerPosition(nextX, nextY);
            setTimerPosition(clampedPosition);
            persistTimerPosition(clampedPosition);
        };

        const handleMouseMove = (event) => {
            handleDragMove(event.clientX, event.clientY);
        };

        const handleTouchMove = (event) => {
            const touch = event.touches[0];
            if (!touch) return;
            handleDragMove(touch.clientX, touch.clientY);
        };

        const stopDragging = () => setIsDraggingTimer(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stopDragging);
        window.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        window.addEventListener("touchend", stopDragging);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopDragging);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", stopDragging);
        };
    }, [isDraggingTimer]);

    useEffect(() => {
        if (!timerPosition) return;

        const handleResize = () => {
            const clampedPosition = clampTimerPosition(
                timerPosition.x,
                timerPosition.y,
            );
            setTimerPosition(clampedPosition);
            persistTimerPosition(clampedPosition);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [timerPosition]);

    const handleTimerMouseDown = (event) => {
        event.preventDefault();
        startTimerDrag(event.clientX, event.clientY);
    };

    const handleTimerTouchStart = (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        startTimerDrag(touch.clientX, touch.clientY);
    };

    // Progress percentage for the ring
    const progress = timeLeft / TIMER_DURATION_SECONDS;
    const circumference = 2 * Math.PI * 18; // radius = 18
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <>
            {/* Fixed timer widget */}
            {timerActive && (
                <div
                    ref={timerWidgetRef}
                    style={{
                        zIndex: 9999,
                        left: timerPosition
                            ? `${timerPosition.x}px`
                            : undefined,
                        top: timerPosition ? `${timerPosition.y}px` : undefined,
                    }}
                    className={`fixed flex flex-col items-center gap-2 bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-xl shadow-lg p-4 min-w-[160px] ${
                        timerPosition ? "" : "top-16 right-4"
                    }`}
                >
                    <div
                        onMouseDown={handleTimerMouseDown}
                        onTouchStart={handleTimerTouchStart}
                        className={`w-full text-[10px] text-center text-[var(--placeholder)] select-none pb-1 border-b border-[var(--light-primary)] ${
                            isDraggingTimer ? "cursor-grabbing" : "cursor-grab"
                        }`}
                    >
                        Trascina per spostare
                    </div>
                    <p className="text-xs font-medium text-[var(--black)] text-center leading-tight">
                        Riavvio del tool tra
                    </p>
                    <div className="relative flex items-center justify-center w-16 h-16">
                        <svg width="64" height="64" viewBox="0 0 44 44">
                            {/* Background ring */}
                            <circle
                                cx="22"
                                cy="22"
                                r="18"
                                fill="none"
                                stroke="var(--light-primary)"
                                strokeWidth="3"
                            />
                            {/* Progress ring */}
                            <circle
                                cx="22"
                                cy="22"
                                r="18"
                                fill="none"
                                stroke={
                                    timeLeft <= 60
                                        ? "#ef4444"
                                        : "var(--primary)"
                                }
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 22 22)"
                                style={{
                                    transition:
                                        "stroke-dashoffset 1s linear, stroke 0.3s",
                                }}
                            />
                        </svg>
                        <span
                            className="absolute text-sm font-medium"
                            style={{
                                color:
                                    timeLeft <= 60 ? "#ef4444" : "var(--black)",
                            }}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    {currentUserRole === "Admin" && (
                        <button
                            onClick={handleShiftsClick}
                            className="text-xs text-[var(--placeholder)] hover:text-[var(--black)] transition"
                        >
                            Annulla
                        </button>
                    )}
                </div>
            )}

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
                        <button
                            className="btn flex gap-2 items-center px-3 md:px-4"
                            onClick={handleTaskClick}
                        >
                            <AddIcon className="w-6" />
                            <p className="hidden lg:block truncate">
                                Programma task
                            </p>
                        </button>
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

                {currentUserRole === "Admin" && (
                    <ShiftsIcon
                        className="w-6 cursor-pointer icon"
                        onClick={handleShiftsClick}
                    />
                )}

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
                    <Notifications
                        onClose={() => setNotificationsModal(false)}
                    />
                )}
            </div>
        </>
    );
}

export default Topbar;

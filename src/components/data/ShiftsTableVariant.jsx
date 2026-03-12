import React, { useState, useEffect, useRef } from "react";
import { useUsers } from "./provider/userAPI/useUsers.js";
import DragIcon from "../../assets/icons/drag.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import { useEmployeeShifts } from "./provider/employeeShiftsAPI_variant/useEmployeeShifts.js";
import { useShiftOrder } from "./provider/shiftOrderAPI/useShiftOrder.js";
import Popup from "../modals/Popup.jsx";

function ShiftsTable({ selectedMonth, onChangesDetected, currentUserRole }) {
    const { users, loading } = useUsers();
    const { shiftOrders, saveShiftOrders } = useShiftOrder();
    const [orderedUsers, setOrderedUsers] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [showNotes, setShowNotes] = useState({});
    const [shiftValues, setShiftValues] = useState(() => {
        const saved = localStorage.getItem("shiftValues");
        return saved ? JSON.parse(saved) : {};
    });
    const { employeeShifts } = useEmployeeShifts();
    const scrollContainerRef = useRef(null);
    const todayColumnRef = useRef(null);
    const [popup, setPopup] = useState({ show: false, type: "", message: "" });

    // Track POST and PUT changes
    const [postChanges, setPostChanges] = useState(() => {
        const saved = localStorage.getItem("shiftPostChanges");
        return saved ? JSON.parse(saved) : {};
    });
    const [putChanges, setPutChanges] = useState(() => {
        const saved = localStorage.getItem("shiftPutChanges");
        return saved ? JSON.parse(saved) : {};
    });

    const shiftMeanings = [
        "O",
        "OP",
        "ON",
        "D",
        "N",
        "F",
        "M",
        "R",
        "C",
        "CA",
        "T",
        "P",
        "CG",
        "ND",
    ];

    // Apply shift order from database
    useEffect(() => {
        if (users.length === 0) {
            setOrderedUsers([]);
            return;
        }

        // If no shift orders exist, use default user order
        if (shiftOrders.length === 0) {
            setOrderedUsers(users);
            return;
        }

        // Create a map of user ID to position
        const positionMap = {};
        shiftOrders.forEach((order) => {
            positionMap[order.POSITIONED_USER_ID] = order.POSITION;
        });

        // Sort users by position, putting users without position at the end
        const sorted = [...users].sort((a, b) => {
            const posA = positionMap[a.ID] || 9999;
            const posB = positionMap[b.ID] || 9999;
            return posA - posB;
        });

        setOrderedUsers(sorted);
    }, [users, shiftOrders]);

    // Save changes to localStorage and notify parent
    useEffect(() => {
        localStorage.setItem("shiftPostChanges", JSON.stringify(postChanges));
        localStorage.setItem("shiftPutChanges", JSON.stringify(putChanges));
        localStorage.setItem("shiftValues", JSON.stringify(shiftValues));

        const hasChanges =
            Object.keys(postChanges).length > 0 ||
            Object.keys(putChanges).length > 0;
        if (onChangesDetected) {
            onChangesDetected(hasChanges, postChanges, putChanges);
        }
    }, [postChanges, putChanges, shiftValues, onChangesDetected]);

    // Expose clear function via ref or prop callback
    useEffect(() => {
        window.clearShiftChanges = () => {
            setPostChanges({});
            setPutChanges({});
            setShiftValues({});
            localStorage.removeItem("shiftPostChanges");
            localStorage.removeItem("shiftPutChanges");
            localStorage.removeItem("shiftValues");
        };

        window.applyPatternChanges = (newPostChanges, newPutChanges) => {
            // Merge pattern changes with existing changes
            setPostChanges((prev) => ({ ...prev, ...newPostChanges }));
            setPutChanges((prev) => ({ ...prev, ...newPutChanges }));

            // Update shiftValues for visual feedback
            setShiftValues((prev) => {
                const updated = { ...prev };
                Object.entries(newPostChanges).forEach(([key, value]) => {
                    updated[key] = value.SHIFT_TYPE;
                });
                Object.entries(newPutChanges).forEach(([key, value]) => {
                    updated[key] = value.SHIFT_TYPE;
                });
                return updated;
            });
        };

        return () => {
            delete window.clearShiftChanges;
            delete window.applyPatternChanges;
        };
    }, []);

    const parseSelectedMonth = () => {
        const months = {
            gennaio: 0,
            febbraio: 1,
            marzo: 2,
            aprile: 3,
            maggio: 4,
            giugno: 5,
            luglio: 6,
            agosto: 7,
            settembre: 8,
            ottobre: 9,
            novembre: 10,
            dicembre: 11,
        };

        const [monthName, year] = selectedMonth.split(" ");
        const monthIndex = months[monthName.toLowerCase()];
        return new Date(parseInt(year), monthIndex, 1);
    };

    const date = parseSelectedMonth();
    const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
    ).getDate();

    const numericDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const dayOfWeekLabels = [
        "Domenica",
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
    ];
    const dayOfWeek = numericDays.map((day) => {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        return dayOfWeekLabels[currentDate.getDay()];
    });

    // Calculate Easter Sunday using Computus algorithm
    const calculateEaster = (year) => {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return { month, day };
    };

    const isHoliday = (day) => {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const month = currentDate.getMonth() + 1;
        const dayOfMonth = currentDate.getDate();
        const year = date.getFullYear();

        // Calculate Easter for the current year
        const easter = calculateEaster(year);

        // Calculate Easter Monday (day after Easter)
        const easterDate = new Date(year, easter.month - 1, easter.day);
        const easterMonday = new Date(easterDate);
        easterMonday.setDate(easterDate.getDate() + 1);

        const holidays = [
            { month: 1, day: 1 }, // New Year's Day (Capodanno)
            { month: 1, day: 6 }, // Epiphany (Epifania)
            { month: easter.month, day: easter.day }, // Easter Sunday (Pasqua)
            { month: easterMonday.getMonth() + 1, day: easterMonday.getDate() }, // Easter Monday (Pasquetta)
            { month: 4, day: 25 }, // Liberation Day (Festa della Liberazione)
            { month: 5, day: 1 }, // Labor Day (Festa del Lavoro)
            { month: 6, day: 2 }, // Republic Day (Festa della Repubblica)
            { month: 8, day: 15 }, // Assumption of Mary (Ferragosto)
            { month: 11, day: 1 }, // All Saints' Day (Ognissanti)
            { month: 12, day: 8 }, // Immaculate Conception (Immacolata Concezione)
            { month: 12, day: 25 }, // Christmas Day (Natale)
            { month: 12, day: 26 }, // Saint Stephen's Day (Santo Stefano)
        ];

        return holidays.some(
            (holiday) => holiday.month === month && holiday.day === dayOfMonth,
        );
    };

    // Check if today is in the current displayed month
    const today = new Date();
    const isCurrentMonth =
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    const todayDate = today.getDate();
    const todayIndex = isCurrentMonth ? todayDate - 1 : -1;

    // Auto-scroll to today's date or start of table
    useEffect(() => {
        if (scrollContainerRef.current) {
            const containerElement = scrollContainerRef.current;

            if (isCurrentMonth && todayColumnRef.current) {
                // Scroll to today's column for current month
                const columnElement = todayColumnRef.current;

                // Calculate scroll position to center today's column
                const scrollPosition =
                    columnElement.offsetLeft -
                    containerElement.clientWidth / 2 +
                    columnElement.clientWidth / 2;

                containerElement.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: "smooth",
                });
            } else {
                // Scroll to start for other months
                containerElement.scrollTo({
                    left: 0,
                    behavior: "smooth",
                });
            }
        }
    }, [selectedMonth, isCurrentMonth, todayIndex]);

    const formatUsername = (user) => {
        return (
            user.split(".")[0].charAt(0).toUpperCase() +
            user.split(".")[0].slice(1) +
            " " +
            (user.split(".")[1].charAt(0).toUpperCase() +
                user.split(".")[1].slice(1))
        );
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        const user = orderedUsers[index];
        // Only allow dragging for Employee role
        if (user.Role !== "Employee") {
            e.preventDefault();
            return;
        }
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Add a slight delay to prevent the dragged item from being transparent
        e.dataTransfer.setData("text/html", e.currentTarget);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();

        // Only allow dropping on Employee roles
        const targetUser = orderedUsers[index];
        if (targetUser.Role !== "Employee") {
            e.dataTransfer.dropEffect = "none";
            return;
        }

        e.dataTransfer.dropEffect = "move";

        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDragOverIndex(null);
            return;
        }

        const newUsers = [...orderedUsers];
        const draggedUser = newUsers[draggedIndex];

        // Remove the dragged item
        newUsers.splice(draggedIndex, 1);
        // Insert it at the drop position
        newUsers.splice(dropIndex, 0, draggedUser);

        setOrderedUsers(newUsers);
        setDragOverIndex(null);

        // Save the new order to backend
        const orderedUserIds = newUsers.map((user) => user.ID);
        saveShiftOrders(orderedUserIds)
            .then((result) => {
                if (result.success) {
                    console.log("Shift order saved successfully");
                    setPopup({
                        show: true,
                        type: "success",
                        message:
                            "Hai spostato con successo la posizione del tecnico",
                    });
                    setTimeout(
                        () => setPopup({ show: false, type: "", message: "" }),
                        3000,
                    );
                } else {
                    console.error("Failed to save shift order:", result.error);
                    setPopup({
                        show: true,
                        type: "error",
                        message:
                            "Non è stato possibile spostare la posizione del tecnico",
                    });
                    setTimeout(
                        () => setPopup({ show: false, type: "", message: "" }),
                        3000,
                    );
                }
            })
            .catch((err) => {
                console.error("Error saving shift order:", err);
                setPopup({
                    show: true,
                    type: "error",
                    message:
                        "Non è stato possibile spostare la posizione del tecnico",
                });
                setTimeout(
                    () => setPopup({ show: false, type: "", message: "" }),
                    3000,
                );
            });
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleShiftChange = (userIndex, dayIndex, value) => {
        const user = orderedUsers[userIndex];

        // Construct date string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(dayIndex + 1).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        // Use employee ID and date as key to ensure uniqueness across months
        const key = `${user.ID}-${formattedDate}`;

        // Get current shift value from database
        const matchingShift = employeeShifts.find(
            (shift) =>
                shift.EMPLOYEE_ID === user.ID &&
                shift.SELECTED_DATE &&
                shift.SELECTED_DATE.split("T")[0] === formattedDate,
        );

        const currentDbValue = matchingShift ? matchingShift.SHIFT_TYPE : "--";
        const shiftId = matchingShift ? matchingShift.ID : null;

        // If value matches database value, remove from shiftValues and tracking
        if (value === currentDbValue) {
            setShiftValues((prev) => {
                const newValues = { ...prev };
                delete newValues[key];
                return newValues;
            });
            setPostChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
            setPutChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
            return;
        }

        // Determine if this is POST, PUT, or DELETE
        if (value === "--" && currentDbValue !== "--") {
            // DELETE: User is removing an existing shift (set to null/delete)
            // Store null in shiftValues to indicate deletion
            setShiftValues((prev) => ({
                ...prev,
                [key]: null,
            }));
            setPutChanges((prev) => ({
                ...prev,
                [key]: {
                    id: shiftId,
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: null,
                },
            }));
            // Remove from POST if it was there
            setPostChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
        } else if (value === "--") {
            // User reset to "--" and DB also has "--", remove from shiftValues and tracking
            setShiftValues((prev) => {
                const newValues = { ...prev };
                delete newValues[key];
                return newValues;
            });
            setPostChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
            setPutChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
        } else if (currentDbValue === "--") {
            // POST: Adding new shift (database had no value)
            setShiftValues((prev) => ({
                ...prev,
                [key]: value,
            }));
            setPostChanges((prev) => ({
                ...prev,
                [key]: {
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: value,
                },
            }));
            // Remove from PUT if it was there
            setPutChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
        } else {
            // PUT: Updating existing shift (database had a value)
            setShiftValues((prev) => ({
                ...prev,
                [key]: value,
            }));
            setPutChanges((prev) => ({
                ...prev,
                [key]: {
                    id: shiftId,
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: value,
                },
            }));
            // Remove from POST if it was there
            setPostChanges((prev) => {
                const newChanges = { ...prev };
                delete newChanges[key];
                return newChanges;
            });
        }
    };

    const getShiftValue = (userIndex, dayIndex) => {
        // Get the user and construct the date for this day
        const user = orderedUsers[userIndex];
        if (!user) return "--";

        // Construct date string directly to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
        const day = String(dayIndex + 1).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        // Use employee ID and date as key
        const key = `${user.ID}-${formattedDate}`;

        // Check if there's a manual change first
        if (key in shiftValues) {
            // If value is null (DELETE operation), show as "--"
            return shiftValues[key] === null ? "--" : shiftValues[key];
        }

        // Find a matching shift in employeeShifts
        const matchingShift = employeeShifts.find(
            (shift) =>
                shift.EMPLOYEE_ID === user.ID &&
                shift.SELECTED_DATE &&
                shift.SELECTED_DATE.split("T")[0] === formattedDate,
        );

        return matchingShift ? matchingShift.SHIFT_TYPE : "--";
    };

    const countShiftsForDay = (time, day) => {
        // Construct date string for the given day
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        const formattedDate = `${year}-${month}-${dayStr}`;

        // Define which shift types to count based on time
        const shiftTypes = time === "Diurno" ? ["D"] : ["N"];

        // Create a map to track shift values for each employee on this day
        const shiftsMap = {};

        // First, add shifts from database
        employeeShifts.forEach((shift) => {
            if (!shift.SELECTED_DATE) return;
            const shiftDate = shift.SELECTED_DATE.split("T")[0];
            if (shiftDate === formattedDate) {
                shiftsMap[shift.EMPLOYEE_ID] = shift.SHIFT_TYPE;
            }
        });

        // Then, override with pending changes (POST and PUT)
        Object.values(postChanges).forEach((change) => {
            if (change.SELECTED_DATE === formattedDate) {
                shiftsMap[change.EMPLOYEE_ID] = change.SHIFT_TYPE;
            }
        });

        Object.values(putChanges).forEach((change) => {
            if (change.SELECTED_DATE === formattedDate) {
                // If SHIFT_TYPE is null (DELETE), remove from map
                if (change.SHIFT_TYPE === null) {
                    delete shiftsMap[change.EMPLOYEE_ID];
                } else {
                    shiftsMap[change.EMPLOYEE_ID] = change.SHIFT_TYPE;
                }
            }
        });

        // Count only shifts that match the shift types, excluding "--" and null
        const count = Object.values(shiftsMap).filter((shiftType) => {
            return (
                shiftType !== "--" &&
                shiftType !== null &&
                shiftTypes.includes(shiftType)
            );
        }).length;

        // Return formatted string with count
        const prefix = time === "Diurno" ? "D" : "N";
        return `${prefix}-${count}`;
    };

    const getShiftCountColor = (time, day) => {
        // Extract the count from the result
        const result = countShiftsForDay(time, day);
        const count = parseInt(result.split("-")[1]);

        // Return classes based on count:
        // 0-1: red, 2: orange, 3: green, 4+: darker green
        if (count <= 1) {
            return "text-white bg-[var(--red)]";
        } else if (count === 2) {
            return "text-white bg-[var(--orange)]";
        } else if (count === 3) {
            return "text-white bg-[var(--green)]";
        } else {
            // 4 or above: darker green
            return "text-white bg-[var(--dark-green)]";
        }
    };

    const isCellModified = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return false;

        // Construct date string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(dayIndex + 1).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        // Use employee ID and date as key
        const key = `${user.ID}-${formattedDate}`;
        return (
            Object.hasOwn(postChanges, key) || Object.hasOwn(putChanges, key)
        );
    };

    const isUserRowModified = (userIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return false;

        // Check if any day in the month has been modified for this user
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");

        for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
            const day = String(dayIndex + 1).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;
            const key = `${user.ID}-${formattedDate}`;

            if (
                Object.hasOwn(postChanges, key) ||
                Object.hasOwn(putChanges, key)
            ) {
                return true;
            }
        }
        return false;
    };

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 w-[800px] max-h-[calc(100vh-14rem)] overflow-x-auto rounded-lg pb-1"
        >
            <div className="min-w-max bg-[var(--bento-bg)] border-t border-[var(--separator)] rounded-lg">
                {/* Header Row 1: Day of Week */}
                <div className="flex sticky top-0 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Giorno della settimana
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {dayOfWeek.map((day, index) => {
                            const isWeekend =
                                day === "Sabato" || day === "Domenica";
                            const isHolidayDay = isHoliday(index + 1);
                            return (
                                <div
                                    key={`dow-${index}`}
                                    className="min-w-[8rem] w-[8rem]"
                                >
                                    <p
                                        className={`${index === todayIndex ? "bg-[var(--weekend-cells)] text-[var(--weekend-text)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--black)]" : "bg-[var(--bento-bg)] text-[var(--gray)]"} text-sm p-4 text-center border-r border-[var(--separator)]`}
                                    >
                                        {day}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Header Row 2: Day of Month */}
                <div className="flex sticky top-10 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Giorno del mese
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {numericDays.map((day, index) => {
                            const isWeekend =
                                dayOfWeek[index] === "Sabato" ||
                                dayOfWeek[index] === "Domenica";
                            const isHolidayDay = isHoliday(day);
                            return (
                                <div
                                    key={`day-${index}`}
                                    ref={
                                        index === todayIndex
                                            ? todayColumnRef
                                            : null
                                    }
                                    className="min-w-[8rem] w-[8rem]"
                                >
                                    <p
                                        className={`${index === todayIndex ? "bg-[var(--weekend-cells)] text-[var(--weekend-text)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--black)]" : "bg-[var(--bento-bg)] text-[var(--gray)]"} text-sm p-4 text-center border-r border-[var(--separator)]`}
                                    >
                                        {day}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Header Row 3: Shift Count */}
                <div className="flex sticky top-20 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--light-primary)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Conteggio turni
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {numericDays.map((day, index) => {
                            const isWeekend =
                                dayOfWeek[index] === "Sabato" ||
                                dayOfWeek[index] === "Domenica";
                            return (
                                <div
                                    key={`count-${index}`}
                                    className="min-w-[8rem] w-[8rem]"
                                >
                                    <div
                                        className={`text-[var(--primary)] ${isWeekend ? "bg-[var(--light-primary)] " : "bg-[var(--light-primary)]"} text-sm p-4 text-center border-r border-[var(--separator)]`}
                                    >
                                        <span
                                            className={`${getShiftCountColor("Diurno", day)} p-2 rounded mr-2 font-bold`}
                                        >
                                            {countShiftsForDay("Diurno", day)}
                                        </span>

                                        <span
                                            className={`${getShiftCountColor("Notturno", day)} p-2 rounded font-bold`}
                                        >
                                            {countShiftsForDay("Notturno", day)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Users Rows */}
                {!loading ? (
                    orderedUsers.map((user, userIndex) => {
                        const isEmployee = user.Role === "Employee";
                        return (
                            <div
                                key={`user-${userIndex}`}
                                className={`flex ${draggedIndex === userIndex ? "opacity-50" : ""} ${dragOverIndex === userIndex && isEmployee ? "border-t-2 border-t-blue-500" : ""}`}
                                draggable={
                                    isEmployee &&
                                    (currentUserRole === "Admin" ||
                                        currentUserRole === "Shift Leader")
                                }
                                onDragStart={(e) =>
                                    handleDragStart(e, userIndex)
                                }
                                onDragOver={(e) => handleDragOver(e, userIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, userIndex)}
                                onDragEnd={handleDragEnd}
                                style={{
                                    cursor: isEmployee ? "grab" : "default",
                                }}
                            >
                                <div
                                    className={`flex items-center justify-center sticky left-0 z-20 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)] ${isUserRowModified(userIndex) ? "!bg-[var(--orange-light)]" : ""}`}
                                >
                                    <div className="flex justify-between min-w-[240px] w-[240px]">
                                        <p className="text-[var(--black)] text-sm p-4 text-start select-none flex items-center gap-2">
                                            {isEmployee &&
                                                currentUserRole !==
                                                    "Employee" && (
                                                    <DragIcon className="w-6 text-[var(--black)]" />
                                                )}
                                            {formatUsername(user.Username)}
                                        </p>
                                        {/*<ArrowRightIcon
                                            className={`w-6 text-[var(--black)] mr-4 cursor-pointer hover:text-[var(--gray)] transition-all duration-300 ${showNotes[user.ID] ? "rotate-[-90deg]" : "rotate-90"}`}
                                            onClick={() =>
                                                setShowNotes((prev) => ({
                                                    ...prev,
                                                    [user.ID]: !prev[user.ID],
                                                }))
                                            }
                                        />*/}
                                    </div>
                                </div>
                                <div className="flex border-b border-[var(--separator)]">
                                    {numericDays.map((day, index) => {
                                        const isWeekend =
                                            dayOfWeek[index] === "Sabato" ||
                                            dayOfWeek[index] === "Domenica";
                                        const isHolidayDay = isHoliday(day);
                                        return (
                                            <div
                                                key={`user-${userIndex}-day-${index}`}
                                                className="min-w-[8rem] w-[8rem]"
                                            >
                                                <div
                                                    className={`py-2 border-r border-[var(--separator)] gap-2 flex flex-col items-center justify-center ${index === todayIndex ? "bg-[var(--weekend-cells)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--weekend-text)]" : ""} ${isCellModified(userIndex, index) ? "!bg-[var(--orange-light)]" : ""}`}
                                                >
                                                    <div className="relative ">
                                                        <select
                                                            value={getShiftValue(
                                                                userIndex,
                                                                index,
                                                            )}
                                                            onChange={(e) =>
                                                                handleShiftChange(
                                                                    userIndex,
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                currentUserRole !==
                                                                    "Admin" &&
                                                                currentUserRole !==
                                                                    "Shift Leader"
                                                            }
                                                            className={`px-8 py-2 font-bold w-full text-center text-lg border border-[var(--light-primary)] rounded-md hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none ${currentUserRole === "Admin" || currentUserRole === "Shift Leader" ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${GetColorForShift(getShiftValue(userIndex, index))} ${getShiftValue(userIndex, index) === "R" ? "focus:text-black" : ""} ${getShiftValue(userIndex, index) === "ND" ? "focus:text-black" : ""}`}
                                                        >
                                                            <option value="--">
                                                                --
                                                            </option>
                                                            {shiftMeanings.map(
                                                                (value) => (
                                                                    <option
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                    >
                                                                        {value ===
                                                                        "CG"
                                                                            ? "C"
                                                                            : value}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col w-full mt-2 gap-2 px-2 ${showNotes[user.ID] ? "block" : "hidden"}`}
                                                    >
                                                        <button className="w-full flex-1 text-xs text-white p-2 px-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition duration-300">
                                                            Aggiungi nota
                                                        </button>
                                                        {/*<button className="w-full flex-1 text-xs text-[var(--primary)] p-2 px-2 rounded-md border border-[var(--primary)] hover:bg-[var(--light-primary)] transition duration-300">
                                                            Leggi nota
                                                        </button>*/}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <h1 className="p-8 pb-64 text-[var(--black)] text-md">
                        Caricamento...
                    </h1>
                )}
            </div>
            {popup.show && <Popup type={popup.type} message={popup.message} />}
        </div>
    );
}

export default ShiftsTable;

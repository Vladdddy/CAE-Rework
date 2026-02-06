import React, { useState, useEffect } from "react";
import { useUsers } from "./provider/userAPI/useUsers.js";
import DragIcon from "../../assets/icons/drag.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";

function ShiftsTable({ selectedMonth }) {
    const { users } = useUsers();
    const [orderedUsers, setOrderedUsers] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [shiftValues, setShiftValues] = useState({});

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
    ];

    // Initialize orderedUsers when users change
    useEffect(() => {
        setOrderedUsers(users);
    }, [users]);

    // Parse selectedMonth to get the date
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

    // Get number of days in the selected month
    const date = parseSelectedMonth();
    const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
    ).getDate();

    // Generate array of days
    const numericDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate day of week for each day in the month
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
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleShiftChange = (userIndex, dayIndex, value) => {
        setShiftValues((prev) => ({
            ...prev,
            [`${userIndex}-${dayIndex}`]: value,
        }));
    };

    const getShiftValue = (userIndex, dayIndex) => {
        return shiftValues[`${userIndex}-${dayIndex}`] || "--";
    };

    return (
        <div className="flex-1 w-[800px] max-h-[calc(100vh-14rem)] overflow-x-auto rounded-lg pb-1">
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
                        {dayOfWeek.map((day, index) => (
                            <div
                                key={`dow-${index}`}
                                className="min-w-[8rem] w-[8rem]"
                            >
                                <p className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 text-center border-r border-[var(--separator)]">
                                    {day}
                                </p>
                            </div>
                        ))}
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
                        {numericDays.map((day, index) => (
                            <div
                                key={`day-${index}`}
                                className="min-w-[8rem] w-[8rem]"
                            >
                                <p className="text-[var(--primary)] bg-[var(--bento-bg)] text-sm p-4 text-center border-r border-[var(--separator)]">
                                    {day}
                                </p>
                            </div>
                        ))}
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
                        {numericDays.map((day, index) => (
                            <div
                                key={`count-${index}`}
                                className="min-w-[8rem] w-[8rem]"
                            >
                                <div className="text-[var(--primary)] bg-[var(--light-primary)] text-sm p-4 text-center border-r border-[var(--separator)]">
                                    <span className="text-[var(--green)] bg-[#32de8410] border border-[#32de8420] p-2 rounded mr-2">
                                        D-2
                                    </span>

                                    <span className="text-[var(--red)] bg-[#de323210] border border-[#de323220] p-2 rounded">
                                        N-0
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users Rows */}
                {orderedUsers.map((user, userIndex) => {
                    const isEmployee = user.Role === "Employee";
                    return (
                        <div
                            key={`user-${userIndex}`}
                            className={`flex ${draggedIndex === userIndex ? "opacity-50" : ""} ${dragOverIndex === userIndex && isEmployee ? "border-t-2 border-t-blue-500" : ""}`}
                            draggable={isEmployee}
                            onDragStart={(e) => handleDragStart(e, userIndex)}
                            onDragOver={(e) => handleDragOver(e, userIndex)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, userIndex)}
                            onDragEnd={handleDragEnd}
                            style={{ cursor: isEmployee ? "grab" : "default" }}
                        >
                            <div className="flex items-center justify-center sticky left-0 z-20 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)]">
                                <div className="min-w-[240px] w-[240px]">
                                    <p className="text-[var(--black)] text-sm p-4 text-start select-none flex items-center gap-2">
                                        {isEmployee && (
                                            <DragIcon className="w-6 text-[var(--black)]" />
                                        )}
                                        {formatUsername(user.Username)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex border-b border-[var(--separator)]">
                                {numericDays.map((day, index) => (
                                    <div
                                        key={`user-${userIndex}-day-${index}`}
                                        className="min-w-[8rem] w-[8rem]"
                                    >
                                        <div className="py-2 border-r border-[var(--separator)] flex items-center justify-center">
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
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`px-8 py-2 font-bold w-full text-center text-lg border border-[var(--light-primary)] rounded-md hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer ${GetColorForShift(getShiftValue(userIndex, index))}`}
                                                >
                                                    <option value="--">
                                                        --
                                                    </option>
                                                    {shiftMeanings.map(
                                                        (value) => (
                                                            <option
                                                                key={value}
                                                                value={value}
                                                            >
                                                                {value}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ShiftsTable;

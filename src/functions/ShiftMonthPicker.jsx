import { useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "../assets/icons/calendar.tsx";
import ArrowLeftIcon from "../assets/icons/arrow-left.tsx";
import ArrowRightIcon from "../assets/icons/arrow-right.tsx";

export default function ShiftMonthPicker({ startDate, setStartDate }) {
    const datePickerRef = useRef(null);

    useEffect(() => {
        if (startDate) {
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            const day = String(startDate.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            localStorage.setItem("selectedDate", dateString);
        }
    }, [startDate]);

    const formatDate = (date, includeDay = false) => {
        const months = [
            "Gennaio",
            "Febbraio",
            "Marzo",
            "Aprile",
            "Maggio",
            "Giugno",
            "Luglio",
            "Agosto",
            "Settembre",
            "Ottobre",
            "Novembre",
            "Dicembre",
        ];
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;

        if (includeDay) {
            return `${date.getDate()} ${monthYear}`;
        }

        return monthYear;
    };

    const handleIconClick = () => {
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);
        }
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(startDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setStartDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(startDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setStartDate(newDate);
    };

    return (
        <div className="flex items-center justify-between w-[320px] z-[49]">
            <div
                onClick={goToPreviousMonth}
                className="cursor-pointer p-2 text-[var(--black)] bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-md"
            >
                <ArrowLeftIcon className="w-6" />
            </div>

            <div className="flex flex-1 justify-center items-center gap-2 p-2 text-[var(--black)] w-full">
                <div
                    onClick={handleIconClick}
                    className="cursor-pointer text-[var(--black)]"
                >
                    <CalendarIcon className="w-6 icon" />
                </div>

                <h1 className="text-xl">{formatDate(startDate, false)}</h1>

                <DatePicker
                    ref={datePickerRef}
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showMonthYearPicker
                    dateFormat="MM/yyyy"
                    className="hidden"
                />
            </div>

            <div
                onClick={goToNextMonth}
                className="cursor-pointer p-2 text-[var(--black)] bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-md"
            >
                <ArrowRightIcon className="w-6 icon" />
            </div>
        </div>
    );
}

import { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "../assets/icons/calendar.tsx";
import ArrowLeftIcon from "../assets/icons/arrow-left.tsx";
import ArrowRightIcon from "../assets/icons/arrow-right.tsx";

export default function DatePickerComponent({
    startDate,
    setStartDate,
    isCalendar,
}) {
    const datePickerRef = useRef(null);

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

        if (isCalendar) {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setStartDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(startDate);

        if (isCalendar) {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setStartDate(newDate);
    };

    return (
        <div
            className={`flex items-center justify-between ${
                isCalendar
                    ? "w-full"
                    : "bg-[var(--bento-bg)] border border-[var(--light-primary)] rounded-md"
            }`}
        >
            <div
                onClick={goToPreviousMonth}
                className="cursor-pointer p-2 text-[var(--black)]"
            >
                <ArrowLeftIcon className="w-6" />
            </div>

            <div className="flex items-center gap-2">
                <div
                    onClick={handleIconClick}
                    className="cursor-pointer text-[var(--black)]"
                >
                    <CalendarIcon className="w-6 icon" />
                </div>

                <h1 className={`${isCalendar ? "text-xl" : "text-md"}`}>
                    {formatDate(startDate, !isCalendar)}
                </h1>

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
                className="cursor-pointer p-2 text-[var(--black)]"
            >
                <ArrowRightIcon className="w-6 icon" />
            </div>
        </div>
    );
}

import DatePickerComponent from "../../functions/DatePicker.jsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";

function Calendar({ startDate, setStartDate, onDayClick }) {
    const today = new Date();
    const isCurrentMonth =
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear();
    const todayDate = today.getDate();

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const days = getDaysInMonth(startDate);
    const weekDays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

    return (
        <div className="flex flex-col items-center justify-center gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)] w-1/2 m-8 mx-auto">
            <div className="flex items-center justify-center gap-8 border-b border-[var(--light-primary)] pb-4 w-full">
                <DatePickerComponent
                    startDate={startDate}
                    setStartDate={setStartDate}
                    isCalendar={true}
                />
            </div>

            <div className="flex items-center gap-1 w-full">
                <div
                    className={`flex items-center gap-1 rounded-md p-1 text-[var(--primary)] bg-[var(--light-primary)]`}
                >
                    <TasksIcon className="w-4" />
                </div>
                <p className="text-xs text-[var(--primary)]">Tasks</p>

                <div className="w-1"></div>

                <div
                    className={`flex items-center gap-1 rounded-md p-1 text-[var(--gray)] bg-[var(--separator)]`}
                >
                    <LogbookIcon className="w-4" />
                </div>
                <p className="text-xs text-[var(--gray)]">Logbook</p>
            </div>

            <div className="w-full">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className="text-center text-sm text-[var(--gray)]"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days grid */}
                <div className="grid grid-cols-7 gap-2 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                    {days.map((day, index) => {
                        const isToday = isCurrentMonth && day === todayDate;
                        return (
                            <div
                                key={index}
                                onClick={() => day && onDayClick(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center rounded-md p-1
                                    ${
                                        day
                                            ? isToday
                                                ? "bg-[var(--light-primary)] text-[var(--primary)] border border-[var(--light-primary)] cursor-pointer"
                                                : "bg-[var(--white)] text-[var(--black)] border border-[var(--light-primary)] cursor-pointer hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition-all duration-200"
                                            : ""
                                    }
                                `}
                            >
                                {day ? (
                                    <div className="w-full h-full flex flex-col items-center justify-between gap-1">
                                        <h1 className="text-l text-center mt-2">
                                            {day}
                                        </h1>

                                        <div className="flex items-center justify-between w-full gap-1">
                                            <div
                                                className={`flex items-center gap-1 rounded-md p-1 text-[var(--primary)] bg-[var(--light-primary)]`}
                                            >
                                                <TasksIcon className="w-4" />
                                                <p className="text-xs">3</p>
                                            </div>

                                            <div
                                                className={`flex items-center gap-1 rounded-md p-1 text-[var(--gray)] bg-[var(--separator)]`}
                                            >
                                                <LogbookIcon className="w-4" />
                                                <p className="text-xs">2</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;

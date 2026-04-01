import DatePickerComponent from "../../functions/DatePicker.jsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";
import { useMemo } from "react";
import { useTasks } from "../data/provider/taskAPI/useTasks";
import { useUnavailableTasks } from "../data/provider/unavailableTaskAPI/useUnavailableTasks";
import { useUnavailableLogbooks } from "../data/provider/unavailableLogbookAPI/useUnavailableLogbooks";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks";

function MobileCalendar({
    startDate,
    setStartDate,
    onDayClick,
    type = "tasks",
}) {
    const { tasks, loading } = useTasks();
    const { tasks: unavailableTasks, loading: unavailableLoading } =
        useUnavailableTasks();
    const { logbooks } = useLogbooks();
    const { logbooks: unavailableLogbooks } = useUnavailableLogbooks();

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

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const getItemDate = (item) => {
        const rawDate = item?.DATE || item?.date;
        if (!rawDate) return null;

        const parsedDate = new Date(rawDate);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const isSameVisibleDay = (item, dayNumber) => {
        const itemDate = getItemDate(item);
        if (!itemDate) return false;

        return (
            itemDate.getDate() === dayNumber &&
            itemDate.getMonth() === startDate.getMonth() &&
            itemDate.getFullYear() === startDate.getFullYear()
        );
    };

    const getItemStatus = (item) =>
        (
            item?.STATUS ||
            item?.status ||
            item?.TaskStatus ||
            item?.taskStatus ||
            ""
        )
            .toString()
            .trim();

    const isUnavailableItem = (item) =>
        item?.TYPE === "Unavailable" || item?.IS_UNAVAILABLE === true;

    const getDayStatusTextColor = (items) => {
        if (!items || items.length === 0) {
            return "text-[var(--black)]";
        }

        const statuses = items.map(getItemStatus).filter(Boolean);

        if (statuses.length === 0) {
            return "text-[var(--black)]";
        }

        if (
            statuses.some(
                (status) =>
                    status === "Non completato" ||
                    status === "Da definire" ||
                    status === "Non iniziato",
            )
        ) {
            return "text-[var(--red)]";
        }

        if (statuses.some((status) => status === "In corso")) {
            return "text-[var(--ambra)]";
        }

        if (
            statuses.every(
                (status) =>
                    status === "Completato" || status === "Completato da SL",
            )
        ) {
            return "text-[var(--green)]";
        }

        return "text-[var(--black)]";
    };

    const mergedTasks = useMemo(
        () => [
            ...(tasks || []),
            ...(unavailableTasks || []).map((task) => ({
                ...task,
                IS_UNAVAILABLE: true,
            })),
        ],
        [tasks, unavailableTasks],
    );

    const mergedLogbooks = useMemo(
        () => [
            ...(logbooks || []),
            ...(unavailableLogbooks || []).map((logbook) => ({
                ...logbook,
                IS_UNAVAILABLE: true,
            })),
        ],
        [logbooks, unavailableLogbooks],
    );

    const days = useMemo(() => getDaysInMonth(startDate), [startDate]);
    const weekDays = ["D", "L", "M", "M", "G", "V", "S"];
    const isLoading = loading || unavailableLoading;

    return (
        <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)] m-4">
            <div className="flex items-center justify-center border-b border-[var(--light-primary)] pb-4">
                <DatePickerComponent
                    startDate={startDate}
                    setStartDate={setStartDate}
                    isCalendar={true}
                />
            </div>

            <div className="overflow-x-auto pb-1">
                <div className="min-w-[560px]">
                    <div className="flex items-center gap-2 w-full mb-2">
                        <div className="flex items-center gap-1 rounded-md p-1 text-[var(--primary)] bg-[var(--light-primary)]">
                            <TasksIcon className="w-4" />
                        </div>
                        <p className="text-xs text-[var(--primary)]">Tasks</p>

                        {type === "logbooks" && (
                            <>
                                <div className="flex items-center gap-1 rounded-md p-1 text-[var(--orange)] bg-[var(--orange-light)]">
                                    <LogbookIcon className="w-4" />
                                </div>
                                <p className="text-xs text-[var(--orange)]">
                                    Logbook
                                </p>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day, index) => (
                            <div
                                key={`${day}-${index}`}
                                className="text-center text-xs text-[var(--gray)]"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => {
                            const isToday = isCurrentMonth && day === todayDate;
                            const tasksForDay = day
                                ? mergedTasks.filter((task) =>
                                      isSameVisibleDay(task, day),
                                  )
                                : [];
                            const logbooksForDay = day
                                ? mergedLogbooks.filter((logbook) =>
                                      isSameVisibleDay(logbook, day),
                                  )
                                : [];
                            const regularTasksForDay = tasksForDay.filter(
                                (task) => !isUnavailableItem(task),
                            );
                            const dayStatusTextColor =
                                type === "logbooks"
                                    ? getDayStatusTextColor([
                                          ...regularTasksForDay,
                                          ...logbooksForDay,
                                      ])
                                    : getDayStatusTextColor(regularTasksForDay);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => day && onDayClick(day)}
                                    disabled={!day}
                                    className={`aspect-square rounded-md border p-1.5 flex flex-col items-center justify-between transition-all duration-200 ${
                                        day
                                            ? isToday
                                                ? "bg-[var(--light-primary)] border border-[var(--primary)] cursor-pointer"
                                                : "bg-[var(--white)] border border-[var(--light-primary)] cursor-pointer hover:bg-[var(--light-primary)]"
                                            : "border-transparent"
                                    }`}
                                >
                                    {day ? (
                                        <>
                                            <p
                                                className={`text-base font-semibold leading-none ${dayStatusTextColor}`}
                                            >
                                                {day}
                                            </p>

                                            {tasksForDay.length > 0 && (
                                                <div className="flex items-center gap-1 text-[var(--primary)]">
                                                    <TasksIcon className="w-3.5" />
                                                    <p className="text-xs leading-none">
                                                        {isLoading
                                                            ? "..."
                                                            : tasksForDay.length}
                                                    </p>
                                                </div>
                                            )}

                                            {type === "logbooks" &&
                                                logbooksForDay.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[var(--orange)]">
                                                        <LogbookIcon className="w-3.5" />
                                                        <p className="text-xs leading-none">
                                                            {
                                                                logbooksForDay.length
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                        </>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MobileCalendar;

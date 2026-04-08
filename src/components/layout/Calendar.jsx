import DatePickerComponent from "../../functions/DatePicker.jsx";
import TasksIcon from "../../assets/icons/tasks.tsx";
import LogbookIcon from "../../assets/icons/logbook.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/taskAPI/useTasks";
import { useUnavailableTasks } from "../data/provider/unavailableTaskAPI/useUnavailableTasks";
import { useUnavailableLogbooks } from "../data/provider/unavailableLogbookAPI/useUnavailableLogbooks";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks";
import { useUsers } from "../data/provider/userAPI/useUsers";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI/useEmployeeShifts";
import { useTaskSimOne } from "../data/provider/taskSimOneAPI/useTaskSimOne";

const SIMULATOR_MAP = {
    1: "109",
    2: "FTD",
    3: "139#1",
    4: "139#3",
    5: "169",
    6: "189",
};

function Calendar({ startDate, setStartDate, onDayClick, type }) {
    const { tasks, loading } = useTasks();
    const { tasks: unavailableTasks, loading: unavailableLoading } =
        useUnavailableTasks();
    const { logbooks: unavailableLogbooks } = useUnavailableLogbooks();
    const { logbooks } = useLogbooks();
    const { users } = useUsers();
    const { employeeShifts } = useEmployeeShifts();
    const { taskSimOne } = useTaskSimOne();
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

    const isDayTask = (task) => {
        const taskTime = (task?.TIME || task?.time || "").toLowerCase();
        return taskTime === "diurno";
    };

    const isNightTask = (task) => {
        const taskTime = (task?.TIME || task?.time || "").toLowerCase();
        return taskTime === "notturno";
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

        const statuses = items
            .map(getItemStatus)
            .filter((s) => Boolean(s) && s !== "Rischedulato");

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

    const pmPlanTasks = (taskSimOne || [])
        .filter((task) => {
            const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
            return simulatorId && SIMULATOR_MAP[simulatorId];
        })
        .map((task) => ({
            ...task,
            DATE: task["Scheduled on"] ?? task.DATE,
            TIME: "Notturno",
            IS_PM_PLAN_TASK: true,
        }));

    const mergedTasks = [
        ...(tasks || []),
        ...(unavailableTasks || []).map((task) => ({
            ...task,
            IS_UNAVAILABLE: true,
        })),
        ...pmPlanTasks,
    ];

    const isTasksLoading = loading || unavailableLoading;

    const mergedLogbooks = [
        ...(logbooks || []),
        ...(unavailableLogbooks || []).map((logbook) => ({
            ...logbook,
            IS_UNAVAILABLE: true,
        })),
    ];

    const getEmployeeShiftCounts = (dayNumber) => {
        if (!dayNumber) {
            return { dayEmployees: 0, nightEmployees: 0 };
        }

        const employeeIds = new Set(
            users
                .filter((user) => user?.Role === "Employee")
                .map((user) => user?.ID),
        );

        const shiftsForDay = employeeShifts.filter((shift) => {
            if (!employeeIds.has(shift?.EMPLOYEE_ID)) return false;

            const shiftDateRaw = shift?.SELECTED_DATE || shift?.selected_date;
            if (!shiftDateRaw) return false;

            const shiftDate = new Date(shiftDateRaw);
            if (Number.isNaN(shiftDate.getTime())) return false;

            return (
                shiftDate.getDate() === dayNumber &&
                shiftDate.getMonth() === startDate.getMonth() &&
                shiftDate.getFullYear() === startDate.getFullYear()
            );
        });

        return {
            dayEmployees: shiftsForDay.filter(
                (shift) => (shift?.SHIFT_TYPE || shift?.shift_type) === "D",
            ).length,
            nightEmployees: shiftsForDay.filter(
                (shift) => (shift?.SHIFT_TYPE || shift?.shift_type) === "N",
            ).length,
        };
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 border border-[var(--light-primary)] rounded-lg p-4 bg-[var(--bento-bg)] flex-1 md:w-[1100px] m-8 mx-8 md:mx-auto">
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
                    <TasksIcon className="w-5" />
                </div>
                <p className="text-sm text-[var(--primary)]">Tasks</p>

                {type === "logbooks" && (
                    <>
                        <div className="w-1"></div>

                        <div
                            className={`flex items-center gap-1 rounded-md p-1 text-[var(--orange)] bg-[var(--orange-light)]`}
                        >
                            <LogbookIcon className="w-5" />
                        </div>
                        <p className="text-sm text-[var(--orange)]">Logbook</p>
                    </>
                )}
            </div>

            <div className="w-full">
                <div className="grid grid-cols-7 gap-4 mb-2">
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
                <div className="grid grid-cols-7 gap-4 pr-2">
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
                        const pmTasksForDay = tasksForDay.filter(
                            (task) => task.IS_PM_PLAN_TASK,
                        );
                        const nonPmTasksForDay = tasksForDay.filter(
                            (task) => !task.IS_PM_PLAN_TASK,
                        );
                        const hasPmIncomplete = pmTasksForDay.some((task) => {
                            const taskDone =
                                task["Task done"] ?? task["Task Done"];
                            return (
                                taskDone !== undefined &&
                                taskDone !== null &&
                                !taskDone
                            );
                        });
                        const dayTasksCount =
                            nonPmTasksForDay.filter(isDayTask).length;
                        const nightTasksCount =
                            nonPmTasksForDay.filter(isNightTask).length;
                        const regularTasksForDay = nonPmTasksForDay.filter(
                            (task) => !isUnavailableItem(task),
                        );
                        let dayStatusTextColor =
                            type === "logbooks"
                                ? getDayStatusTextColor([
                                      ...regularTasksForDay,
                                      ...logbooksForDay,
                                  ])
                                : getDayStatusTextColor(regularTasksForDay);
                        if (hasPmIncomplete) {
                            dayStatusTextColor = "text-[var(--red)]";
                        }
                        const { dayEmployees, nightEmployees } =
                            getEmployeeShiftCounts(day);

                        const hasCertification = day
                            ? [...tasksForDay, ...logbooksForDay].some(
                                  (item) =>
                                      item?.SUBCATEGORY === "Certification",
                              )
                            : false;

                        return (
                            <div
                                key={index}
                                onClick={() => day && onDayClick(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center rounded-md p-1
                                    ${
                                        day
                                            ? isToday
                                                ? "bg-[var(--light-primary)] border cursor-pointer"
                                                : "bg-[var(--white)] border cursor-pointer hover:bg-[var(--light-primary)] transition-all duration-200"
                                            : ""
                                    }
                                `}
                                style={
                                    day
                                        ? {
                                              borderColor: hasCertification
                                                  ? "var(--weekend-text)"
                                                  : isToday
                                                    ? "var(--primary)"
                                                    : "var(--light-primary)",
                                          }
                                        : undefined
                                }
                            >
                                {day ? (
                                    <div className="w-full h-full flex flex-col items-center justify-between gap-1">
                                        {type === "tasks" && (
                                            <div className="flex items-center justify-between w-full gap-1">
                                                <div className="flex items-center gap-1 rounded-md p-1 text-[var(--green)]">
                                                    <UserIcon className="w-5" />
                                                    <p className="text-sm">
                                                        {dayEmployees}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 rounded-md p-1 text-[var(--primary)]">
                                                    <UserIcon className="w-5" />
                                                    <p className="text-sm">
                                                        {nightEmployees}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <h1
                                            className={`text-xl font-bold text-center mt-2 ${dayStatusTextColor}`}
                                        >
                                            {day}
                                        </h1>

                                        <div className="flex flex-col items-center justify-center w-full gap-1">
                                            {type === "tasks" ? (
                                                !isTasksLoading &&
                                                nonPmTasksForDay.length > 0 && (
                                                    <>
                                                        <div className="flex items-center justify-between w-full gap-1">
                                                            <div className="p-1 text-[var(--green)] bg-[var(--light-primary)] rounded-md flex flex-col gap-2">
                                                                <div className="flex items-center gap-1 rounded-md">
                                                                    <TasksIcon className="w-5" />
                                                                    <p className="text-sm">
                                                                        {
                                                                            dayTasksCount
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="p-1 text-[var(--primary)] bg-[var(--light-primary)] rounded-md flex flex-col gap-2">
                                                                <div className="flex items-center gap-1 rounded-md">
                                                                    <TasksIcon className="w-5" />
                                                                    <p className="text-sm">
                                                                        {
                                                                            nightTasksCount
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            ) : (
                                                <div className="flex flex-col items-center justify-center w-full gap-1">
                                                    <div className="flex items-center justify-between w-full gap-1">
                                                        {nonPmTasksForDay.length >
                                                            0 && (
                                                            <div className="flex items-center gap-1 rounded-md p-1 text-[var(--primary)] bg-[var(--light-primary)]">
                                                                <TasksIcon className="w-5" />
                                                                <p className="text-sm">
                                                                    {isTasksLoading
                                                                        ? "..."
                                                                        : nonPmTasksForDay.length}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {type === "logbooks" &&
                                                            logbooksForDay.length >
                                                                0 && (
                                                                <div className="flex items-center gap-1 rounded-md p-1 text-[var(--orange)] bg-[var(--orange-light)]">
                                                                    <LogbookIcon className="w-5" />
                                                                    <p className="text-sm">
                                                                        {isTasksLoading
                                                                            ? "..."
                                                                            : logbooksForDay.length}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
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

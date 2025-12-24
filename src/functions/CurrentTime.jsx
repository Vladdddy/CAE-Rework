import { useState, useEffect } from "react";

export default function CurrentTime() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentDay] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        return currentTime.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDay = () => {
        return currentDay.toLocaleDateString("it-IT", {
            day: "2-digit",
            weekday: "short",
            month: "short",
        });
    };

    return (
        <div className="flex flex-row items-center gap-4">
            <p className="text-[var(--gray)] text-sm border-r border-[var(--separator)] pr-4">
                {formatDay()}
            </p>
            <p className="text-[var(--black)] text-2xl">{formatTime()}</p>
        </div>
    );
}

export function GetTodayDate(date) {
    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        weekday: "short",
        month: "short",
    });
}

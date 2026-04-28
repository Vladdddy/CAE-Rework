export function getPmPlanTime(task) {
    const turn = task["Turn"];
    if (turn && turn.toLowerCase() === "diurno") return "Diurno";

    const performedOn = task["Performed on"];
    if (performedOn) {
        const date = new Date(performedOn);
        if (!isNaN(date)) {
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const afterStart = hours > 7 || (hours === 7 && minutes >= 30);
            const beforeEnd = hours < 20;
            if (afterStart && beforeEnd) return "Diurno";
        }
    }

    return "Notturno";
}

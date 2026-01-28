export function CheckExistingDays(selectedDays, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start)
        return [];

    // Exact mapping from your dropdown
    const DAY_MAP = {
        "Ogni Giorno": "all",
        Lunedì: 1,
        Martedì: 2,
        Mercoledì: 3,
        Giovedì: 4,
        Venerdì: 5,
        Sabato: 6,
        Domenica: 0,
    };

    // Get selected day numbers
    const selected = selectedDays.split(",").map((d) => d.trim());
    const countAll = selected.includes("Ogni Giorno");
    const dayNumbers = countAll
        ? [0, 1, 2, 3, 4, 5, 6]
        : selected
              .map((d) => DAY_MAP[d])
              .filter((n) => n !== undefined && n !== "all");

    if (dayNumbers.length === 0) return [];

    // Collect matching dates
    const matchingDates = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        if (dayNumbers.includes(current.getDay())) {
            // Add a copy of the date to avoid reference issues
            matchingDates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }

    return matchingDates;
}

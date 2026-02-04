export function GetColorForShift(shift) {
    switch (shift) {
        case "O":
            return "bg-blue-100 text-blue-800";
        case "OP":
            return "bg-indigo-200 text-indigo-900";
        case "ON":
            return "bg-purple-100 text-purple-800";
        case "D":
            return "bg-blue-100 text-blue-800";
        case "N":
            return "bg-purple-100 text-purple-800";
        case "F":
            return "bg-yellow-100 text-yellow-800";
        case "M":
            return "bg-orange-100 text-orange-800";
        case "R":
            return "bg-slate-100 text-slate-800";
        case "C":
            return "bg-green-100 text-green-800";
        case "CA":
            return "bg-red-100 text-red-800";
        default:
            return "bg-[var(--light-primary)] text-[var(--primary)]";
    }
}

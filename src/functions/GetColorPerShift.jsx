export function GetColorForShift(shift) {
    switch (shift) {
        case "O":
            return "bg-green-800 text-cyan-400";
        case "OP":
            return "bg-blue-400 text-cyan-400";
        case "ON":
            return "bg-blue-900 text-cyan-400";
        case "D":
            return "bg-green-800 text-white";
        case "N":
            return "bg-blue-900 text-white";
        case "F":
            return "bg-yellow-100 text-yellow-800";
        case "M":
            return "bg-white text-red-600";
        case "R":
            return "bg-white text-white border border-green-600";
        case "C":
            return "bg-orange-500 text-black";
        case "CA":
            return "bg-red-100 text-red-800";
        case "T":
            return "bg-fuchsia-100 text-fuchsia-800";
        case "P":
            return "bg-yellow-400 text-black";
        default:
            return "bg-[var(--white)] text-[var(--gray)]";
    }
}

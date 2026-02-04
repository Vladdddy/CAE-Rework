import { useState } from "react";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import ArrowIcon from "../../assets/icons/arrow-right.tsx";

function ShiftLegend() {
    const [showLegend, setShowLegend] = useState(false);

    const shiftMeanings = {
        O: "Mattino",
        OP: "Pomeriggio",
        ON: "Notturno",
        D: "Giorno",
        N: "Notte",
        F: "Ferie",
        M: "Malattia",
        R: "Riposo",
        C: "Corso",
        CA: "Chiusura",
    };

    return (
        <div
            className={`flex flex-col justify-between items-start text-center bg-[var(--white)] border border-[var(--white)] rounded-lg px-4 py-4 transition-all duration-300 ${showLegend ? "gap-8 w-auto" : "gap-0 w-fit"}`}
        >
            <div
                className="flex flex-row justify-center items-center text-center gap-1 text-[var(--gray)] cursor-pointer hover:text-[var(--black)] transition-all duration-200"
                onClick={() => setShowLegend((prev) => !prev)}
            >
                <p>{showLegend ? "Nascondi" : "Mostra"} Leggenda</p>
                <ArrowIcon
                    className={`w-6 transition-transform duration-300 ${showLegend ? "rotate-[-90deg]" : "rotate-90"}`}
                />
            </div>
            <div
                className={`overflow-hidden transition-all duration-300 ${showLegend ? "max-h-96 opacity-100" : "max-h-0 w-0 opacity-0"}`}
            >
                <div className="flex flex-row justify-between w-auto items-center text-center gap-4">
                    {Object.entries(shiftMeanings).map(([shift, meaning]) => (
                        <div
                            key={shift}
                            className="flex flex-col justify-center items-center text-center gap-1 w-20"
                        >
                            <p
                                className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg ${GetColorForShift(shift)}`}
                            >
                                {shift}
                            </p>
                            <p className="text-[var(--black)] text-sm">
                                {meaning}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ShiftLegend;

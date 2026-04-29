import { useState, useEffect } from "react";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import CloseIcon from "../../assets/icons/close.tsx";

function ShiftLegend() {
    const [showLegend, setShowLegend] = useState(false);
    const [position, setPosition] = useState(() => ({
        x: Math.max(16, window.innerWidth - 356),
        y: 16, // mt-4 is typically 1rem = 16px
    }));
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
        T: "Trasferta",
        P: "Paternità",
        CG: "Corso Giorno",
        FND: "Ferie Non Disponibile",
    };

    const handleMouseDown = (e) => {
        // Only allow dragging from the header area
        if (e.target.closest(".legend-header")) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add/remove event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) => ({
                x: Math.min(prev.x, Math.max(16, window.innerWidth - 356)),
                y: Math.max(16, prev.y),
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /*return (
        <div
            className={`flex flex-col justify-between items-start text-center bg-[var(--white)] border border-[var(--light-primary)] rounded-xl px-2 py-4 transition-all duration-300 ${showLegend ? "gap-8 w-auto" : "gap-0 w-fit"}`}
        >
            <button
                className="flex flex-row justify-center items-center text-center gap-1 text-[var(--gray)] cursor-pointer hover:text-[var(--black)] transition-all duration-200"
                onClick={() => setShowLegend((prev) => !prev)}
            >
                <p className="text-md">Leggenda turni</p>
                <ArrowIcon
                    className={`w-6 transition-transform duration-300 ${showLegend ? "rotate-[-90deg]" : "rotate-90"}`}
                />
            </button>
            <div
                className={` overflow-y-auto pr-8 overflow-hidden transition-all duration-300 ${showLegend ? "max-h-[calc(100vh-20rem)] opacity-100" : "max-h-0 w-0 opacity-0"}`}
            >
                <div className="flex flex-col justify-between w-auto items-start text-center gap-4 ">
                    {Object.entries(shiftMeanings).map(([shift, meaning]) => (
                        <div
                            key={shift}
                            className="flex flex-row justify-start items-center text-center gap-4"
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
    );*/
    return (
        <div className="relative">
            <button
                className="btn flex items-center justify-center text-center gap-1"
                onClick={() => setShowLegend((prev) => !prev)}
            >
                <p className="text-md">Legenda turni</p>
            </button>
            <div
                className={`fixed z-40 bg-[var(--white)] w-[90vw] max-w-[340px] p-4 py-0 rounded-lg overflow-y-auto pr-2 overflow-hidden transition-opacity duration-300 shadow-lg border border-[var(--separator)] ${showLegend ? "max-h-[calc(100vh-12rem)] opacity-100" : "max-h-0 w-0 opacity-0"}`}
                style={{
                    left: `${Math.max(16, Math.min(position.x, window.innerWidth - 356))}px`,
                    top: `${position.y}px`,
                    cursor: isDragging ? "grabbing" : "default",
                }}
                onMouseDown={handleMouseDown}
            >
                <div className="legend-header flex flex-col justify-between w-auto items-start text-center cursor-grab select-none">
                    <div className="sticky top-0 bg-[var(--white)] flex items-center justify-between text-lg mb-2 text-[var(--black)] font-semibold border-b border-[var(--light-primary)] text-start w-full py-4">
                        Legenda Turni
                        <CloseIcon
                            className="w-6 text-[var(--gray)] cursor-pointer hover:text-[var(--black)] transition-all duration-200"
                            onClick={() => setShowLegend(false)}
                        />
                    </div>
                    {Object.entries(shiftMeanings).map(([shift, meaning]) => (
                        <div
                            key={shift}
                            className="flex flex-row justify-start items-center text-center gap-4 py-2"
                        >
                            <p
                                className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg ${GetColorForShift(shift)}`}
                            >
                                {shift === "CG" ? "CD" : shift}
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

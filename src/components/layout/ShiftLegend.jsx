import { useState, useEffect } from "react";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import CloseIcon from "../../assets/icons/close.tsx";

function ShiftLegend() {
    const [showLegend, setShowLegend] = useState(false);
    const [position, setPosition] = useState(() => ({
        x: Math.max(16, window.innerWidth - 620),
        y: 16,
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

    const bgMeanings = [
        {
            style: { backgroundColor: "var(--light-primary)" },
            label: "Fine settimana",
        },
        {
            style: { backgroundColor: "var(--weekend-cells)" },
            label: "Oggi",
        },
        {
            style: { backgroundColor: "var(--holiday-cells)" },
            label: "Festività",
        },
        {
            tailwind: "bg-green-500",
            label: "Turno aggiunto",
        },
        {
            tailwind: "bg-green-200",
            label: "Turno cambiato",
        },
        {
            tailwind: "bg-violet-400",
            label: "Turno tolto",
        },
    ];

    const handleMouseDown = (e) => {
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
                x: Math.min(prev.x, Math.max(16, window.innerWidth - 620)),
                y: Math.max(16, prev.y),
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="relative">
            <button
                className="btn flex items-center justify-center text-center gap-1"
                onClick={() => setShowLegend((prev) => !prev)}
            >
                <p className="text-md">Legenda turni</p>
            </button>
            <div
                className={`fixed z-40 bg-[var(--white)] w-[90vw] max-w-[600px] p-4 py-0 rounded-lg overflow-y-auto overflow-x-hidden transition-opacity duration-300 shadow-lg border border-[var(--separator)] ${showLegend ? "opacity-100" : "max-h-0 w-0 opacity-0"}`}
                style={{
                    left: `${Math.max(16, Math.min(position.x, window.innerWidth - 620))}px`,
                    top: `${position.y}px`,
                    cursor: isDragging ? "grabbing" : "default",
                }}
                onMouseDown={handleMouseDown}
            >
                <div className="legend-header flex flex-col w-full cursor-grab select-none">
                    {/* Header */}
                    <div className="sticky top-0 bg-[var(--white)] flex items-center justify-between text-lg mb-3 text-[var(--black)] font-semibold border-b border-[var(--light-primary)] text-start w-full py-4">
                        Legenda Turni
                        <CloseIcon
                            className="w-6 text-[var(--gray)] cursor-pointer hover:text-[var(--black)] transition-all duration-200"
                            onClick={() => setShowLegend(false)}
                        />
                    </div>

                    {/* Shift codes — 2 per row */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pb-3">
                        {Object.entries(shiftMeanings).map(
                            ([shift, meaning]) => (
                                <div
                                    key={shift}
                                    className="flex flex-row items-center gap-3"
                                >
                                    <p
                                        className={`flex-shrink-0 flex items-center justify-center rounded-lg w-10 h-10 font-bold text-base ${GetColorForShift(shift)}`}
                                    >
                                        {shift === "CG" ? "CD" : shift}
                                    </p>
                                    <p className="text-[var(--black)] text-sm">
                                        {meaning}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[var(--separator)] my-2" />

                    {/* Background color meanings — 2 per row */}
                    <p className="text-sm font-semibold text-[var(--gray)] mb-2">
                        Colori di sfondo
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pb-4">
                        {bgMeanings.map(({ style, tailwind, label }) => (
                            <div
                                key={label}
                                className="flex flex-row items-center gap-3"
                            >
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-lg border border-[var(--separator)] ${tailwind ?? ""}`}
                                    style={style}
                                />
                                <p className="text-[var(--black)] text-sm">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShiftLegend;

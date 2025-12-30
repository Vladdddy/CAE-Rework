import React from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import DoneIcon from "../../assets/icons/done.tsx";

function Popup({ type, message }) {
    return (
        <>
            <div className="fixed inset-0 flex items-start justify-center z-50 pt-16 pointer-events-none">
                {type === "success" ? (
                    <div
                        className="flex items-center gap-2 text-[var(--green)] bg-[#32de8420] rounded-xl p-4 max-w-lg w-full mx-4 pointer-events-auto animate-slideDown backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DoneIcon className="w-6" />
                        <p>{message || "Operazione completata con successo"}</p>
                    </div>
                ) : type === "error" ? (
                    <div
                        className="flex items-center gap-2 text-[var(--red)] bg-[#ff464620] rounded-xl p-4 max-w-lg w-full mx-4 pointer-events-auto animate-slideDown backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CloseIcon className="w-6" />
                        <p>{message || "Errore durante l'operazione"}</p>
                    </div>
                ) : (
                    <div
                        className="flex items-center gap-2 text-[var(--red)] bg-[#ff464620] rounded-xl p-4 max-w-lg w-full mx-4 pointer-events-auto animate-slideDown backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CloseIcon className="w-6" />
                        <p>Qualcosa è andato storto, riprova</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Popup;

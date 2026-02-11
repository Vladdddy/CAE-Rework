import { useState } from "react";
import BellIcon from "../../assets/icons/bell.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import LongArrowIcon from "../../assets/icons/long-arrow.tsx";
import SendIcon from "../../assets/icons/send.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";

function Notifications({ onClose }) {
    const [emptyText, setEmptyText] = useState("");

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm cursor-default flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <BellIcon className="w-6" />
                        <h1 className="text-xl">Notifiche</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-8 max-h-[calc(60vh-4rem)] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-2 w-3/4">
                        <h1 className="text-md text-[var(--gray)]">Vlad B:</h1>
                        <p className="text-sm text-[var(--black)] w-full border border-[var(--light-primary)] rounded-md p-2">
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Necessitatibus quas ab veniam quo iusto
                            debitis! Dolores expedita vitae in adipisci?
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 w-3/4">
                        <h1 className="text-md text-[var(--gray)]">Vlad B:</h1>
                        <div className="text-sm w-full border border-[var(--light-primary)] rounded-md p-2">
                            <p className="text-[var(--black)] mb-4">
                                Cambio turno in data:{" "}
                                <span className="text-[var(--primary)] font-bold">
                                    Lunedì, 2/02/2026
                                </span>
                            </p>
                            <div className="flex flex-row gap-2 items-center">
                                {GetColorForShift("ON").split(" ")[0] && (
                                    <p
                                        className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg opacity-30 ${GetColorForShift("ON")}`}
                                    >
                                        ON
                                    </p>
                                )}
                                <LongArrowIcon className="w-6" />
                                {GetColorForShift("D").split(" ")[0] && (
                                    <p
                                        className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg ${GetColorForShift("D")}`}
                                    >
                                        D
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-sm w-full border border-[var(--light-primary)] rounded-md p-2">
                            <p className="text-[var(--black)] mb-4">
                                Cambio turno in data:{" "}
                                <span className="text-[var(--primary)] font-bold">
                                    Martedì, 3/02/2026
                                </span>
                            </p>
                            <div className="flex flex-row gap-2 items-center">
                                {GetColorForShift("O").split(" ")[0] && (
                                    <p
                                        className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg opacity-30 ${GetColorForShift("O")}`}
                                    >
                                        O
                                    </p>
                                )}
                                <LongArrowIcon className="w-6" />
                                {GetColorForShift("CA").split(" ")[0] && (
                                    <p
                                        className={`flex flex-col justify-center items-center rounded-lg px-1 py-1 w-12 h-12 font-bold text-lg ${GetColorForShift("CA")}`}
                                    >
                                        CA
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-end items-end w-3/4 self-end">
                        <h1 className="text-md text-[var(--gray)]">Tu:</h1>
                        <p className="text-sm text-[var(--black)] w-full border border-[var(--light-primary)] rounded-md p-2">
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 pt-4 mt-4">
                    <input
                        type="text"
                        className="w-full h-[44px] p-3 border border-[var(--light-primary)] overflow-y-none rounded-md bg-[var(--white)] text-[var(--black)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                        placeholder="Scrivi qui..."
                        value={emptyText}
                        onChange={(e) => setEmptyText(e.target.value)}
                    ></input>
                    <button
                        className={`btn flex gap-2 items-center h-[44px] ${emptyText ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                        disabled={!emptyText}
                    >
                        <SendIcon className="w-6" />
                        Invia
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Notifications;

import React from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import LogoutIcon from "../../assets/icons/logout.tsx";
import { useUsers } from "../data/provider/userAPI/useUsers";
import { useNavigate } from "react-router-dom";

function LogoutModal({ onClose }) {
    const { logout } = useUsers();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/signin");
    };
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)] ">
                        <LogoutIcon className="w-6" />
                        <h1 className="text-xl">Uscire</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-1 my-8">
                    <h3 className="text-md text-[var(--gray)]">
                        Sei sicuro di voler effettuare il logout?
                    </h3>
                </div>

                <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                    <button className="btn gray-btn" onClick={onClose}>
                        Annulla
                    </button>

                    <button className="btn delete" onClick={handleLogout}>
                        <p>Esci</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;

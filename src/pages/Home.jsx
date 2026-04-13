import React from "react";
import { useState, useEffect } from "react";
import Logo from "../../src/assets/cae-logo.png";
import Rotorsim from "../../public/rotorsim.jpg";
import Cae from "../../public/cae2.png";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import LogoutIcon from "../assets/icons/logout";
import LogoutModal from "../components/modals/LogoutModal.jsx";
import DashboardIcon from "../assets/icons/dashboard.js";

function Home() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUsername, currentUserRole } = useUsers();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    const handleLogoutClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const formatNamePart = (value) => {
        if (!value) {
            return "";
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const [firstName = "", lastName = ""] = (currentUsername || "").split(".");
    const displayName =
        formatNamePart(firstName) || currentUsername || "Utente";
    const displayLastName = formatNamePart(lastName);

    return (
        <section className="flex h-screen overflow-hidden">
            <div className="overflow-y-auto h-full p-6 w-full">
                <div className="flex flex-col gap-4 w-full flex-1 mb-6 border-b border-[var(--separator)] pb-6">
                    <div className="flex items-center gap-4">
                        <img className="w-16" src={Logo} alt="Logo" />
                        <h1 className="text-2xl font-semibold text-[var(--black)]">
                            Applicazioni
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogoutClick}
                            className="text-[var(--red)] hover:text-[var(--gray)]"
                        >
                            <LogoutIcon className="w-5" />
                        </button>
                        <p className="text-sm text-[var(--black)]">
                            {displayName}
                            {displayLastName ? ` ${displayLastName}` : ""}
                        </p>

                        <p className="text-xs text-[var(--gray)]">•</p>
                        <p className="text-sm text-[var(--gray)]">
                            {currentUserRole}
                        </p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-[var(--black)] mb-4">
                    App (4)
                </h2>

                <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col gap-2">
                        <div
                            onClick={() => navigate("/dashboard")}
                            className="bg-[var(--light-primary)] rounded-2xl p-4 w-20 h-20 flex items-center justify-center shadow-md hover:opacity-80 cursor-pointer transition-all duration-200"
                        >
                            <img className="w-10" src={Logo} alt="Logo" />
                        </div>
                        <p className="text-sm font-medium text-[var(--black)] text-center">
                            TechOne
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div
                            onClick={() =>
                                navigate("https://172.254.60.218:3000/totem/")
                            }
                            className="rounded-2xl flex items-center justify-center shadow-md hover:opacity-80 cursor-pointer transition-all duration-200"
                        >
                            <img
                                className="w-20 h-20 rounded-2xl"
                                src={Rotorsim}
                                alt="Logo"
                            />
                        </div>
                        <p className="text-sm font-medium text-[var(--black)] text-center">
                            Totem
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div
                            onClick={() =>
                                navigate("https://172.254.60.218:3000/mobile")
                            }
                            className="rounded-2xl flex items-center justify-center shadow-md hover:opacity-80 cursor-pointer transition-all duration-200"
                        >
                            <img
                                className="w-20 h-20 rounded-2xl"
                                src={Cae}
                                alt="Logo"
                            />
                        </div>
                        <p className="text-sm font-medium text-[var(--black)] text-center max-w-20 text-center">
                            SimOne Mobile
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div
                            onClick={() =>
                                navigate(
                                    "http://172.254.60.111:1880/ui/#!/0?socketid=jGqLQlTym8Ea__NwAACl%23%2F7",
                                )
                            }
                            className="bg-[var(--light-primary)] rounded-2xl p-4 w-20 h-20 flex items-center justify-center shadow-md hover:opacity-80 cursor-pointer transition-all duration-200"
                        >
                            <DashboardIcon className="w-10 text-[var(--primary)]" />
                        </div>
                        <p className="text-sm font-medium text-[var(--black)] text-center">
                            Dashboard
                        </p>
                    </div>
                </div>
            </div>

            {isModalOpen && <LogoutModal onClose={handleCloseModal} />}
        </section>
    );
}

export default Home;

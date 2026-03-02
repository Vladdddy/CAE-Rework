import React, { useState, useEffect } from "react";
import Logo from "../../src/assets/cae-logo.png";
import ViewIcon from "../assets/icons/view";
import HideIcon from "../assets/icons/hide";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const { changePassword, currentUserId, loading } = useUsers();
    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate passwords are not empty
        if (newPassword.trim() === "" || confirmPassword.trim() === "") {
            setPasswordError(true);
            setPasswordMismatch(false);
            return;
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setPasswordMismatch(true);
            setPasswordError(false);
            return;
        }

        // Check if currentUserId is available
        if (!currentUserId) {
            console.error("Current user ID not found");
            return;
        }

        // Use the new changePassword API endpoint
        const result = await changePassword(currentUserId, newPassword);

        if (result.success) {
            // Navigate to dashboard after successful password change
            navigate("/dashboard");
        } else {
            console.error("Failed to update password:", result.error);
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen">
            {loading ? (
                <div className="text-[var(--gray)]">Caricamento...</div>
            ) : (
                <div className="flex flex-col items-center gap-16 mx-auto">
                    <img className="w-32" src={Logo} alt="Logo" />

                    <form className="flex flex-col gap-8 w-80">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Password nuova
                            </h3>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (
                                            passwordError &&
                                            e.target.value.trim()
                                        ) {
                                            setPasswordError(false);
                                        }
                                        if (passwordMismatch) {
                                            setPasswordMismatch(false);
                                        }
                                    }}
                                    className="w-full text-[var(--black)] p-2 pr-10 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                                    maxLength={50}
                                    placeholder="Inserisci la password nuova"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--gray)] hover:text-[var(--black)] transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <HideIcon className="w-5 h-5" />
                                    ) : (
                                        <ViewIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Conferma password
                            </h3>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (
                                            passwordError &&
                                            e.target.value.trim()
                                        ) {
                                            setPasswordError(false);
                                        }
                                        if (passwordMismatch) {
                                            setPasswordMismatch(false);
                                        }
                                    }}
                                    className="w-full text-[var(--black)] p-2 pr-10 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                                    maxLength={50}
                                    placeholder="Conferma la password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--gray)] hover:text-[var(--black)] transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <HideIcon className="w-5 h-5" />
                                    ) : (
                                        <ViewIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-sm text-red-500 mt-1">
                                    Inserisci una password valida.
                                </p>
                            )}
                            {passwordMismatch && (
                                <p className="text-sm text-red-500 mt-1">
                                    Le password non corrispondono.
                                </p>
                            )}
                        </div>

                        <button
                            className="btn"
                            type="submit"
                            onClick={handlePasswordChange}
                        >
                            Salva
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
}

export default ChangePassword;

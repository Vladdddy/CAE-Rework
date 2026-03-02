import React from "react";
import Logo from "../../src/assets/cae-logo.png";
import { useState, useEffect } from "react";

function VerifyEmail() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const [username, setUsername] = useState("");
    const [verifyCode, setVerifyCode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (username.trim() === "") {
            setVerifyCode(true);
            return;
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-16 mx-auto">
                <img className="w-32" src={Logo} alt="Logo" />

                <form className="flex flex-col gap-4 w-80">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Codice</h3>
                        <input
                            type="number"
                            name="verifyCode"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (verifyCode && e.target.value.trim()) {
                                    setVerifyCode(false);
                                }
                            }}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci il codice"
                            required
                        />
                    </div>

                    {verifyCode && (
                        <p className="text-sm text-red-500">
                            Il codice inserito non è valido.
                        </p>
                    )}

                    <button className="btn" type="submit" onClick={handleLogin}>
                        Verifica
                    </button>
                </form>
            </div>
        </section>
    );
}

export default VerifyEmail;

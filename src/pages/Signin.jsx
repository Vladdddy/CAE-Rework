import React from "react";
import Logo from "../../src/assets/cae-logo.png";
import { useState, useEffect } from "react";

function Signin() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    return (
        <section className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-16 mx-auto">
                <img className="w-32" src={Logo} alt="Logo" />

                <form className="flex flex-col gap-8 w-80">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Username</h3>
                        <input
                            type="text"
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci lo username"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Password</h3>
                        <input
                            type="password"
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci la password"
                            required
                        />
                    </div>

                    <button className="btn" type="submit">
                        Accedi
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Signin;

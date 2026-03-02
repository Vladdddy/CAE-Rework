import React from "react";
import Logo from "../../src/assets/cae-logo.png";
import ViewIcon from "../assets/icons/view";
import HideIcon from "../assets/icons/hide";
import { useState, useEffect } from "react";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useNavigate } from "react-router-dom";

function Signin() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useUsers();
    const [loginError, setLoginError] = useState(false);
    const [invalidCredentials, setInvalidCredentials] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (username.trim() === "" || password.trim() === "") {
            setLoginError(true);
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            result.data.user.firstAccess
                ? navigate("/change-password")
                : navigate("/dashboard");
        } else {
            setInvalidCredentials(true);
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-16 mx-auto">
                <img className="w-32" src={Logo} alt="Logo" />

                <form className="flex flex-col gap-8 w-80">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Username</h3>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (loginError && e.target.value.trim()) {
                                    setLoginError(false);
                                }
                            }}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci lo username"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Password</h3>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (loginError && e.target.value.trim()) {
                                        setLoginError(false);
                                    }
                                }}
                                className="w-full text-[var(--black)] p-2 pr-10 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                                maxLength={50}
                                placeholder="Inserisci la password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--gray)] hover:text-[var(--black)] transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <HideIcon className="w-5 h-5" />
                                ) : (
                                    <ViewIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-start">
                            <p
                                onClick={() => navigate("/change-password")}
                                className="mt-4 text-sm text-[var(--gray)] text-start cursor-pointer hover:text-[var(--black)] transition-colors"
                            >
                                Password dimenticata?
                            </p>
                        </div>

                        {loginError && (
                            <p className="text-sm text-red-500 mt-1">
                                Inserisci username e password validi.
                            </p>
                        )}
                        {invalidCredentials && (
                            <p className="text-sm text-red-500 mt-1">
                                Username o password errati.
                            </p>
                        )}
                    </div>

                    <button className="btn" type="submit" onClick={handleLogin}>
                        Accedi
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Signin;

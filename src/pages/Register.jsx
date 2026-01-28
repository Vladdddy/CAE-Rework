import React from "react";
import Logo from "../../src/assets/cae-logo.png";
import ArrowRightIcon from "../assets/icons/arrow-right";
import ViewIcon from "../assets/icons/view";
import HideIcon from "../assets/icons/hide";
import { useState, useEffect } from "react";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useNavigate } from "react-router-dom";

function Register() {
    const [isDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode === "true";
    });
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { register, fetchUsers } = useUsers();
    const [loginError, setLoginError] = useState(false);
    const [invalidCredentials, setInvalidCredentials] = useState(false);
    const [selectedRole, setSelectedRole] = useState("Employee");
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

        if (
            name.trim() === "" ||
            password.trim() === "" ||
            surname.trim() === ""
        ) {
            setLoginError(true);
            return;
        }

        const username = `${name.toLowerCase()}.${surname.toLowerCase()}`;

        const result = await register(username, password, selectedRole);

        if (result.success) {
            await fetchUsers();
            navigate("/dashboard");
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
                        <h3 className="text-sm text-[var(--gray)]">Nome</h3>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (loginError && e.target.value.trim()) {
                                    setLoginError(false);
                                }
                            }}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci il nome"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Cognome</h3>
                        <input
                            type="text"
                            name="surname"
                            value={surname}
                            onChange={(e) => {
                                setSurname(e.target.value);
                                if (loginError && e.target.value.trim()) {
                                    setLoginError(false);
                                }
                            }}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--bento-bg)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 placeholder:text-[var(--placeholder)]"
                            maxLength={50}
                            placeholder="Inserisci il cognome"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Ruolo</h3>
                        <div className="relative ">
                            <select
                                name=""
                                id=""
                                value={selectedRole}
                                onChange={(e) =>
                                    setSelectedRole(e.target.value)
                                }
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                <option value="Employee">Employee</option>
                                <option value="Shift Leader">
                                    Shift Leader
                                </option>
                                <option value="Admin">Admin</option>
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
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
                        {loginError && (
                            <p className="text-sm text-red-500 mt-1">
                                Inserisci i dati corretti.
                            </p>
                        )}
                        {invalidCredentials && (
                            <p className="text-sm text-red-500 mt-1">
                                Qualcosa è andato storto.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-row gap-1 items-center">
                        <h3 className="text-sm text-[var(--gray)]">Utente:</h3>
                        <p className="text-sm text-[var(--black)]">{`${name.toLowerCase()}.${surname.toLowerCase()}`}</p>
                    </div>

                    <div className="flex flex-col w-full gap-2 mt-4">
                        <button
                            className="btn"
                            type="submit"
                            onClick={handleLogin}
                        >
                            Aggiungi
                        </button>
                        <button
                            className="btn gray-btn"
                            onClick={() => navigate(-1)}
                        >
                            Indietro
                        </button>
                    </div>
                </form>

                <p className="text-xs text-[var(--placeholder)] text-center">
                    *Questa pagina è temporanea e serve per la registrazione
                    degli utenti*
                </p>
            </div>
        </section>
    );
}

export default Register;

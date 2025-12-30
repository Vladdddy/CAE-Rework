import { useState, useEffect } from "react";
import { UserContext } from "./userContext";

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUsername, setCurrentUsername] = useState("Guest");
    const [currentUserRole, setCurrentUserRole] = useState("Employee");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users once on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Validate token and load user info on mount
    useEffect(() => {
        const loadUserFromToken = async () => {
            const result = await validateToken();
            if (result && result.user) {
                setCurrentUsername(result.user.username);
                setCurrentUserRole(result.user.role);
            }
        };
        loadUserFromToken();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await fetch("http://localhost:3000/users");

            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();

            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (newUser) => {
        try {
            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user: newUser }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add user:", errorData);
                throw new Error("Failed to add user");
            }
            const savedUser = await response.json();
            newUser.id = savedUser.id;
            setUsers((prev) => [...prev, newUser]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateUser = async (id, updatedUser) => {
        console.log("Updating user with ID:", id, "with data:", updatedUser);
        try {
            const response = await fetch(`http://localhost:3000/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user: updatedUser, id: id }),
            });

            if (!response.ok) throw new Error("Failed to update user");
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id ? { ...updatedUser, id } : user
                )
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete user");
            setUsers((prev) => prev.filter((user) => user.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const login = async (username, password) => {
        console.log("Logging in with", { username });

        try {
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error("Login failed");
            const data = await response.json();

            // Save token to localStorage
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            // Set current user
            if (data.user) {
                setCurrentUsername(data.user?.username);
                setCurrentUserRole(data.user?.role);
            }

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const register = async (username, password, selectedRole) => {
        console.log("Registering with", { username });

        try {
            const response = await fetch(
                "http://localhost:3000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        role: selectedRole,
                    }),
                }
            );

            if (!response.ok) throw new Error("Registration failed");
            console.log("Registration successful for", username);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setCurrentUsername("Guest");
        setCurrentUserRole("Employee");
    };

    const validateToken = async () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const response = await fetch(
                "http://localhost:3000/users/validate",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                // Token is invalid or expired
                localStorage.removeItem("token");
                return false;
            }

            const data = await response.json();
            return data; // Return user data from backend
        } catch (err) {
            localStorage.removeItem("token");
            setError(err.message);
            return false;
        }
    };

    return (
        <UserContext.Provider
            value={{
                users,
                currentUsername,
                currentUserRole,
                loading,
                error,
                fetchUsers,
                addUser,
                updateUser,
                deleteUser,
                login,
                register,
                logout,
                validateToken,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

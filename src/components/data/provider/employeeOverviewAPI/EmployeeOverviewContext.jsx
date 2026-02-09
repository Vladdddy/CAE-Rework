import { useState, useEffect } from "react";
import { EmployeeOverviewContext } from "./employeeOverviewContext";

const API_URL = import.meta.env.VITE_API_URL;

export const EmployeeOverviewProvider = ({ children }) => {
    const [employeeOverviews, setEmployeeOverviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch employee overviews on mount and every 1 minute
    useEffect(() => {
        fetchEmployeeOverviews();

        const interval = setInterval(() => {
            fetchEmployeeOverviews(true); // Silent refresh
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval);
    }, []);

    const fetchEmployeeOverviews = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/employeeOverview`);

            if (!response.ok)
                throw new Error("Failed to fetch employee overviews");
            const data = await response.json();

            setEmployeeOverviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const fetchEmployeeOverviewById = async (id) => {
        try {
            const response = await fetch(`${API_URL}/employeeOverview/${id}`);

            if (!response.ok)
                throw new Error("Failed to fetch employee overview");
            const data = await response.json();

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const addEmployeeOverview = async (newEmployeeOverview) => {
        try {
            const response = await fetch(`${API_URL}/employeeOverview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ employeeOverview: newEmployeeOverview }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add employee overview:", errorData);
                throw new Error("Failed to add employee overview");
            }
            const savedEmployeeOverview = await response.json();
            newEmployeeOverview.id = savedEmployeeOverview.id;
            setEmployeeOverviews((prev) => [...prev, newEmployeeOverview]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateEmployeeOverview = async (id, updatedEmployeeOverview) => {
        console.log(
            "Updating employee overview with ID:",
            id,
            "with data:",
            updatedEmployeeOverview,
        );
        try {
            const response = await fetch(`${API_URL}/employeeOverview/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeOverview: updatedEmployeeOverview,
                    id: id,
                }),
            });

            if (!response.ok)
                throw new Error("Failed to update employee overview");
            setEmployeeOverviews((prev) =>
                prev.map((employeeOverview) =>
                    employeeOverview.id === id
                        ? { ...updatedEmployeeOverview, id }
                        : employeeOverview,
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteEmployeeOverview = async (id) => {
        try {
            const response = await fetch(`${API_URL}/employeeOverview/${id}`, {
                method: "DELETE",
            });

            if (!response.ok)
                throw new Error("Failed to delete employee overview");
            setEmployeeOverviews((prev) =>
                prev.filter((employeeOverview) => employeeOverview.id !== id),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <EmployeeOverviewContext.Provider
            value={{
                employeeOverviews,
                loading,
                error,
                fetchEmployeeOverviews,
                fetchEmployeeOverviewById,
                addEmployeeOverview,
                updateEmployeeOverview,
                deleteEmployeeOverview,
            }}
        >
            {children}
        </EmployeeOverviewContext.Provider>
    );
};

import { useState, useEffect } from "react";
import { EmployeeShiftsContext } from "./employeeShiftsContext";

const API_URL = import.meta.env.VITE_API_URL;

export const EmployeeShiftsProvider = ({ children }) => {
    const [employeeShifts, setEmployeeShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch employee shifts on mount and every 1 minute
    useEffect(() => {
        fetchEmployeeShifts();

        const interval = setInterval(() => {
            fetchEmployeeShifts(true); // Silent refresh
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval);
    }, []);

    const fetchEmployeeShifts = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/employeeShift`);

            if (!response.ok)
                throw new Error("Failed to fetch employee shifts");
            const data = await response.json();

            setEmployeeShifts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const addEmployeeShift = async (newEmployeeShift) => {
        try {
            const response = await fetch(`${API_URL}/employeeShift`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ employeeShift: newEmployeeShift }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add employee shift:", errorData);
                throw new Error("Failed to add employee shift");
            }
            const savedEmployeeShift = await response.json();
            newEmployeeShift.id = savedEmployeeShift.id;
            setEmployeeShifts((prev) => [...prev, newEmployeeShift]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateEmployeeShift = async (id, updatedEmployeeShift) => {
        console.log(
            "Updating employee shift with ID:",
            id,
            "with data:",
            updatedEmployeeShift,
        );
        try {
            const response = await fetch(`${API_URL}/employeeShift/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeShift: updatedEmployeeShift,
                    id: id,
                }),
            });

            if (!response.ok)
                throw new Error("Failed to update employee shift");
            setEmployeeShifts((prev) =>
                prev.map((employeeShift) =>
                    employeeShift.id === id
                        ? { ...updatedEmployeeShift, id }
                        : employeeShift,
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteEmployeeShift = async (id) => {
        try {
            const response = await fetch(`${API_URL}/employeeShift/${id}`, {
                method: "DELETE",
            });

            if (!response.ok)
                throw new Error("Failed to delete employee shift");
            setEmployeeShifts((prev) =>
                prev.filter((employeeShift) => employeeShift.id !== id),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <EmployeeShiftsContext.Provider
            value={{
                employeeShifts,
                loading,
                error,
                fetchEmployeeShifts,
                addEmployeeShift,
                updateEmployeeShift,
                deleteEmployeeShift,
            }}
        >
            {children}
        </EmployeeShiftsContext.Provider>
    );
};

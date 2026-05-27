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

            // Backend now returns daily records transformed from monthly JSON
            // Format: { ID, EMPLOYEE_ID, SELECTED_DATE, SHIFT_TYPE, MONTHLY_RECORD_ID }
            setEmployeeShifts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const fetchEmployeeShiftsByRange = async (
        employeeId,
        startDate,
        endDate,
    ) => {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
            });

            if (employeeId) {
                params.append("employeeId", employeeId);
            }

            const response = await fetch(
                `${API_URL}/employeeShift/range?${params.toString()}`,
            );

            if (!response.ok)
                throw new Error("Failed to fetch employee shifts by range");

            return await response.json();
        } catch (err) {
            setError(err.message);
            return [];
        }
    };

    const addEmployeeShift = async (newEmployeeShift) => {
        try {
            // Backend expects { employeeShifts: [...] } with array format
            const shiftsArray = Array.isArray(newEmployeeShift)
                ? newEmployeeShift
                : [newEmployeeShift];

            const response = await fetch(`${API_URL}/employeeShift`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ employeeShifts: shiftsArray }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData?.details || errorData?.error || "Failed to add employee shift";
                console.error("Failed to add employee shift — server said:", msg);
                throw new Error(msg);
            }

            const result = await response.json();

            // Refresh data to get the updated shifts with proper IDs
            await fetchEmployeeShifts(true);

            return { success: true, message: result.message };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const addEmployeeShifts = async (shiftsArray) => {
        // Batch add multiple shifts (more efficient with new backend)
        return await addEmployeeShift(shiftsArray);
    };

    const updateEmployeeShift = async (id, updatedEmployeeShift) => {
        console.log(
            "Updating employee shift with ID:",
            id,
            "with data:",
            updatedEmployeeShift,
        );

        try {
            // For the monthly backend, we need to find the shift and update it
            // The ID format is: monthlyRecordId_day
            const shift = employeeShifts.find((s) => s.ID === id);

            if (!shift) {
                throw new Error("Shift not found");
            }

            // Extract day from the date
            const day = new Date(
                updatedEmployeeShift.SELECTED_DATE || shift.SELECTED_DATE,
            ).getDate();
            const monthlyRecordId = shift.MONTHLY_RECORD_ID;

            const response = await fetch(
                `${API_URL}/employeeShift/${monthlyRecordId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        updates: [
                            {
                                day: day,
                                shiftType: updatedEmployeeShift.SHIFT_TYPE,
                            },
                        ],
                    }),
                },
            );

            if (!response.ok)
                throw new Error("Failed to update employee shift");

            // Update local state
            setEmployeeShifts((prev) =>
                prev.map((employeeShift) =>
                    employeeShift.ID === id
                        ? {
                              ...employeeShift,
                              SHIFT_TYPE: updatedEmployeeShift.SHIFT_TYPE,
                              SELECTED_DATE:
                                  updatedEmployeeShift.SELECTED_DATE ||
                                  employeeShift.SELECTED_DATE,
                          }
                        : employeeShift,
                ),
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateMultipleShifts = async (monthlyRecordId, updates) => {
        // Update multiple days in a single month
        // updates: [{ day, shiftType }, ...]
        try {
            const response = await fetch(
                `${API_URL}/employeeShift/${monthlyRecordId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ updates }),
                },
            );

            if (!response.ok)
                throw new Error("Failed to update employee shifts");

            // Refresh data
            await fetchEmployeeShifts(true);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteEmployeeShift = async (id) => {
        try {
            // Find the shift to get employee ID and date
            const shift = employeeShifts.find((s) => s.ID === id);

            if (!shift) {
                throw new Error("Shift not found");
            }

            const params = new URLSearchParams({
                employeeId: shift.EMPLOYEE_ID,
                date: shift.SELECTED_DATE,
            });

            const response = await fetch(
                `${API_URL}/employeeShift?${params.toString()}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok)
                throw new Error("Failed to delete employee shift");

            // Update local state
            setEmployeeShifts((prev) =>
                prev.filter((employeeShift) => employeeShift.ID !== id),
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteMonthlyRecord = async (monthlyRecordId) => {
        // Delete an entire monthly record
        try {
            const response = await fetch(
                `${API_URL}/employeeShift/month/${monthlyRecordId}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok)
                throw new Error("Failed to delete monthly shift record");

            // Refresh data
            await fetchEmployeeShifts(true);

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
                fetchEmployeeShiftsByRange,
                addEmployeeShift,
                addEmployeeShifts,
                updateEmployeeShift,
                updateMultipleShifts,
                deleteEmployeeShift,
                deleteMonthlyRecord,
            }}
        >
            {children}
        </EmployeeShiftsContext.Provider>
    );
};

import { useState, useEffect } from "react";
import { PatternShiftContext } from "./patternShiftContext";

const API_URL = import.meta.env.VITE_API_URL;

export const PatternShiftProvider = ({ children }) => {
    const [patternShifts, setPatternShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch pattern shifts on mount
    useEffect(() => {
        fetchPatternShifts();
    }, []);

    const fetchPatternShifts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/patternShift`);
            if (!response.ok) throw new Error("Failed to fetch pattern shifts");
            const data = await response.json();
            setPatternShifts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addPatternShift = async (name, shift_list, type) => {
        try {
            const response = await fetch(`${API_URL}/patternShift`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    shift_list,
                    type: type || "Personalized",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add pattern shift:", errorData);
                throw new Error("Failed to add pattern shift");
            }

            const data = await response.json();
            // Normalize property names to uppercase to match database format
            const normalizedData = {
                ID: data.id,
                NAME: data.name,
                SHIFT_LIST: data.shift_list,
                TYPE: data.type,
            };
            setPatternShifts((prev) => [...prev, normalizedData]);
            return { success: true, data: normalizedData };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deletePatternShift = async (id) => {
        try {
            const response = await fetch(`${API_URL}/patternShift/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete pattern shift");
            setPatternShifts((prev) =>
                prev.filter((patternShift) => patternShift.ID !== id),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <PatternShiftContext.Provider
            value={{
                patternShifts,
                loading,
                error,
                fetchPatternShifts,
                addPatternShift,
                deletePatternShift,
            }}
        >
            {children}
        </PatternShiftContext.Provider>
    );
};

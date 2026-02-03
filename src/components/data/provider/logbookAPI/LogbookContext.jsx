import { useState, useEffect } from "react";
import { LogbookContext } from "./logbookContext";

const API_URL = import.meta.env.VITE_API_URL;

export const LogbookProvider = ({ children }) => {
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch logbooks on mount and every 1 minute
    useEffect(() => {
        fetchLogbooks();

        const interval = setInterval(() => {
            fetchLogbooks(true); // Silent refresh
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval);
    }, []);

    const fetchLogbooks = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/logbooks`);
            if (!response.ok) throw new Error("Failed to fetch logbooks");
            const data = await response.json();

            setLogbooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const addLogbook = async (newLogbook) => {
        try {
            const response = await fetch(`${API_URL}/logbooks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ logbook: newLogbook }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add logbook:", errorData);
                throw new Error("Failed to add logbook");
            }
            const savedLogbook = await response.json();
            newLogbook.id = savedLogbook.id;
            setLogbooks((prev) => [...prev, newLogbook]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateLogbook = async (id, updatedLogbook) => {
        console.log(
            "Updating logbook with ID:",
            id,
            "with data:",
            updatedLogbook,
        );
        try {
            const response = await fetch(`${API_URL}/logbooks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ logbook: updatedLogbook, id: id }),
            });

            if (!response.ok) throw new Error("Failed to update logbook");
            setLogbooks((prev) =>
                prev.map((logbook) =>
                    logbook.id === id ? { ...updatedLogbook, id } : logbook,
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteLogbook = async (id) => {
        console.log("Deleting logbook with ID:", id);

        try {
            const response = await fetch(`${API_URL}/logbooks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete logbook");
            setLogbooks((prev) => prev.filter((logbook) => logbook.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <LogbookContext.Provider
            value={{
                logbooks,
                loading,
                error,
                fetchLogbooks,
                addLogbook,
                updateLogbook,
                deleteLogbook,
            }}
        >
            {children}
        </LogbookContext.Provider>
    );
};

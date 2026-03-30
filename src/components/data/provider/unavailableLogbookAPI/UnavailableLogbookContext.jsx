import { useState, useEffect } from "react";
import { UnavailableLogbookContext } from "./unavailableLogbookContext";

const API_URL = import.meta.env.VITE_API_URL;

export const UnavailableLogbookProvider = ({ children }) => {
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch unavailable logbooks on mount and every 1 minute
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

            const response = await fetch(`${API_URL}/unavailableLogbook`);

            if (!response.ok)
                throw new Error("Failed to fetch unavailable logbooks");
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
            const existingIds = (logbooks || [])
                .map((logbook) => Number(logbook?.ID ?? logbook?.id))
                .filter((id) => Number.isFinite(id));

            const generatedId =
                existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

            const logbookWithId = {
                ...newLogbook,
                id: newLogbook?.id ?? newLogbook?.ID ?? generatedId,
            };

            const response = await fetch(`${API_URL}/unavailableLogbook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ logbook: logbookWithId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(async () => ({
                    details: await response.text().catch(() => ""),
                }));
                console.error("Failed to add unavailable logbook:", errorData);
                throw new Error(
                    errorData?.details || "Failed to add unavailable logbook",
                );
            }

            const savedLogbook = await response.json();

            const savedId = savedLogbook?.id ?? logbookWithId.id;

            setLogbooks((prev) => [
                ...prev,
                {
                    ...logbookWithId,
                    id: savedId,
                    ID: savedId,
                },
            ]);

            return { success: true, data: savedLogbook };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateLogbook = async (id, updatedLogbook) => {
        try {
            const response = await fetch(
                `${API_URL}/unavailableLogbook/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ logbook: updatedLogbook, id }),
                },
            );

            if (!response.ok)
                throw new Error("Failed to update unavailable logbook");
            setLogbooks((prev) =>
                prev.map((logbook) =>
                    Number(logbook?.id ?? logbook?.ID) === Number(id)
                        ? { ...updatedLogbook, id: Number(id), ID: Number(id) }
                        : logbook,
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteLogbook = async (id) => {
        try {
            const response = await fetch(
                `${API_URL}/unavailableLogbook/${id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok)
                throw new Error("Failed to delete unavailable logbook");
            setLogbooks((prev) =>
                prev.filter(
                    (logbook) =>
                        Number(logbook?.id ?? logbook?.ID) !== Number(id),
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <UnavailableLogbookContext.Provider
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
        </UnavailableLogbookContext.Provider>
    );
};

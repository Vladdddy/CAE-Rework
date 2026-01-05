import { useState } from "react";
import { NoteContext } from "./noteContext";

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notes once on mount

    const fetchNotes = async (id) => {
        console.log("Fetching notes for ID:", id);
        try {
            setLoading(true);

            const response = await fetch(`http://localhost:3000/notes/${id}`);
            if (!response.ok) throw new Error("Failed to fetch notes");
            const data = await response.json();

            setNotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createNote = async (taskId, userId, description) => {
        console.log("Creating note for task ID:", taskId);
        try {
            const response = await fetch(
                `http://localhost:3000/notes/${taskId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        createdBy: userId,
                        description: description,
                        createdTime: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to create note");
            const data = await response.json();

            // Refresh notes after creating
            await fetchNotes(taskId);

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <NoteContext.Provider
            value={{
                notes,
                loading,
                error,
                fetchNotes,
                createNote,
            }}
        >
            {children}
        </NoteContext.Provider>
    );
};

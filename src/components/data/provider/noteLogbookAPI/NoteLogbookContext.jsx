import { useState } from "react";
import { NoteLogbookContext } from "./noteLogbookContext";

const API_URL = import.meta.env.VITE_API_URL;

export const NoteLogbookProvider = ({ children }) => {
    const [noteLogbooks, setNoteLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notes for a specific logbook

    const fetchNoteLogbooks = async (id) => {
        console.log("Fetching logbook notes for ID:", id);
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/notesLogbook/${id}`);
            if (!response.ok) throw new Error("Failed to fetch logbook notes");
            const data = await response.json();

            setNoteLogbooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createNoteLogbook = async (logbookId, userId, description, type) => {
        console.log("Creating note for logbook ID:", logbookId);
        try {
            const response = await fetch(
                `${API_URL}/notesLogbook/${logbookId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        createdBy: userId,
                        description: description,
                        createdTime: new Date().toISOString(),
                        type: type,
                    }),
                },
            );

            if (!response.ok) throw new Error("Failed to create logbook note");
            const data = await response.json();

            // Refresh notes after creating
            await fetchNoteLogbooks(logbookId);

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <NoteLogbookContext.Provider
            value={{
                noteLogbooks,
                loading,
                error,
                fetchNoteLogbooks,
                createNoteLogbook,
            }}
        >
            {children}
        </NoteLogbookContext.Provider>
    );
};

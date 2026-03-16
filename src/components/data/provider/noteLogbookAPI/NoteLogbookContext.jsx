import { useState, useCallback } from "react";
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

    const fetchAllNoteLogbooks = useCallback(async () => {
        console.log("Fetching all logbook notes");
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/notesLogbook`);
            if (!response.ok)
                throw new Error("Failed to fetch all logbook notes");
            const data = await response.json();

            setNoteLogbooks(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

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

    const editNoteLogbook = async (noteId, description) => {
        console.log("Editing logbook note ID:", noteId);
        try {
            const response = await fetch(`${API_URL}/notesLogbook/${noteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) throw new Error("Failed to edit logbook note");
            const data = await response.json();

            // Refresh notes after editing
            await fetchAllNoteLogbooks();

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteNoteLogbook = async (noteId) => {
        console.log("Deleting logbook note ID:", noteId);
        try {
            const response = await fetch(`${API_URL}/notesLogbook/${noteId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete logbook note");

            return { success: true };
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
                fetchAllNoteLogbooks,
                createNoteLogbook,
                editNoteLogbook,
                deleteNoteLogbook,
            }}
        >
            {children}
        </NoteLogbookContext.Provider>
    );
};

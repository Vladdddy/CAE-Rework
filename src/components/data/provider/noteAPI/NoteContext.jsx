import { useState, useCallback } from "react";
import { NoteContext } from "./noteContext";

const API_URL = import.meta.env.VITE_API_URL;

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notes once on mount

    const fetchNotes = async (id) => {
        console.log("Fetching notes for ID:", id);
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/notes/${id}`);
            if (!response.ok) throw new Error("Failed to fetch notes");
            const data = await response.json();

            setNotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllNotes = useCallback(async () => {
        console.log("Fetching all notes");
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/notes`);
            if (!response.ok) throw new Error("Failed to fetch all notes");
            const data = await response.json();

            setNotes(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createNote = async (taskId, userId, description, type) => {
        console.log("Creating note for task ID:", taskId);
        try {
            const response = await fetch(`${API_URL}/notes/${taskId}`, {
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
            });

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

    const editNote = async (noteId, description) => {
        console.log("Editing note ID:", noteId);
        try {
            const response = await fetch(`${API_URL}/notes/${noteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) throw new Error("Failed to edit note");
            const data = await response.json();

            // Refresh notes after editing
            await fetchAllNotes();

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteNote = async (noteId) => {
        console.log("Deleting note ID:", noteId);
        try {
            const response = await fetch(`${API_URL}/notes/${noteId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete note");

            return { success: true };
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
                fetchAllNotes,
                createNote,
                editNote,
                deleteNote,
            }}
        >
            {children}
        </NoteContext.Provider>
    );
};

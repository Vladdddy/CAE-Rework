import { useState, useEffect } from "react";
import { PMTechCommentsContext } from "./pmTechCommentsContext";

const API_URL = import.meta.env.VITE_API_URL;

export const PMTechCommentsProvider = ({ children }) => {
    const [techComments, setTechComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all tech comments on mount and every 1 minute
    useEffect(() => {
        fetchAllTechComments();

        const interval = setInterval(() => {
            fetchAllTechComments(true); // Silent refresh
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval);
    }, []);

    const fetchAllTechComments = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/yearlyPMTechComments`);

            if (!response.ok) throw new Error("Failed to fetch tech comments");
            const data = await response.json();

            setTechComments(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching tech comments:", err);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const fetchTechCommentsByRecordId = async (recordId) => {
        try {
            const response = await fetch(
                `${API_URL}/yearlyPMTechComments/${recordId}`,
            );

            if (!response.ok) throw new Error("Failed to fetch tech comments");
            const data = await response.json();

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            console.error("Error fetching tech comments by recordId:", err);
            return { success: false, error: err.message };
        }
    };

    const addTechComment = async (recordId, techComment, techName) => {
        try {
            const response = await fetch(`${API_URL}/yearlyPMTechComments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recordId,
                    techComment,
                    techName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add tech comment:", errorData);
                throw new Error("Failed to add tech comment");
            }

            const savedComment = await response.json();
            setTechComments((prev) => [
                {
                    ID: savedComment.id,
                    RecordID: recordId,
                    TechComment: techComment,
                    TechName: techName,
                    CommentDate: savedComment.commentDate,
                },
                ...prev,
            ]);

            return { success: true, data: savedComment };
        } catch (err) {
            setError(err.message);
            console.error("Error adding tech comment:", err);
            return { success: false, error: err.message };
        }
    };

    const updateTechComment = async (id, techComment, techName) => {
        try {
            const response = await fetch(
                `${API_URL}/yearlyPMTechComments/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        techComment,
                        techName,
                    }),
                },
            );

            if (!response.ok) throw new Error("Failed to update tech comment");

            setTechComments((prev) =>
                prev.map((comment) =>
                    comment.ID === id
                        ? {
                              ...comment,
                              TechComment: techComment,
                              TechName: techName,
                          }
                        : comment,
                ),
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error("Error updating tech comment:", err);
            return { success: false, error: err.message };
        }
    };

    const deleteTechComment = async (id) => {
        try {
            const response = await fetch(
                `${API_URL}/yearlyPMTechComments/${id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) throw new Error("Failed to delete tech comment");

            setTechComments((prev) =>
                prev.filter((comment) => comment.ID !== id),
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error("Error deleting tech comment:", err);
            return { success: false, error: err.message };
        }
    };

    return (
        <PMTechCommentsContext.Provider
            value={{
                techComments,
                loading,
                error,
                fetchAllTechComments,
                fetchTechCommentsByRecordId,
                addTechComment,
                updateTechComment,
                deleteTechComment,
            }}
        >
            {children}
        </PMTechCommentsContext.Provider>
    );
};

import { useState, useEffect } from "react";
import { EmployeeMessageContext } from "./employeeMessageContext";

const API_URL = import.meta.env.VITE_API_URL;

export const EmployeeMessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all messages on mount and every 30 seconds
    useEffect(() => {
        fetchMessages();

        const interval = setInterval(() => {
            fetchMessages(true); // Silent refresh
        }, 30000); // 30000ms = 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/employeeMessage`);

            if (!response.ok) throw new Error("Failed to fetch messages");
            const data = await response.json();
            setMessages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const fetchMessageById = async (id) => {
        try {
            const response = await fetch(`${API_URL}/employeeMessage/${id}`);

            if (!response.ok) throw new Error("Failed to fetch message");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const fetchUserMessages = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/user/${userId}`,
            );

            if (!response.ok) throw new Error("Failed to fetch user messages");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const fetchSentMessages = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/sent/${userId}`,
            );

            if (!response.ok) throw new Error("Failed to fetch sent messages");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const fetchReceivedMessages = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/received/${userId}`,
            );

            if (!response.ok)
                throw new Error("Failed to fetch received messages");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const fetchUnreadCount = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/unread/count/${userId}`,
            );

            if (!response.ok) throw new Error("Failed to fetch unread count");
            const data = await response.json();
            setUnreadCount(data.unreadCount);
            return { success: true, count: data.unreadCount };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const sendMessage = async (senderId, receiverId, messageContent) => {
        try {
            const response = await fetch(`${API_URL}/employeeMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderId,
                    receiverId,
                    messageContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData?.details || errorData?.error || "Failed to send message";
                console.error("Failed to send message — server said:", msg);
                throw new Error(msg);
            }

            const data = await response.json();
            await fetchMessages(true); // Refresh messages
            return { success: true, messageId: data.messageId };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/${id}/read`,
                {
                    method: "PUT",
                },
            );

            if (!response.ok) throw new Error("Failed to mark message as read");

            // Update local state
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.ID === id ? { ...msg, IS_READ: 1 } : msg,
                ),
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const markAllAsRead = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/employeeMessage/read-all/${userId}`,
                {
                    method: "PUT",
                },
            );

            if (!response.ok)
                throw new Error("Failed to mark all messages as read");

            const data = await response.json();

            // Update local state
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.RECEIVER_ID === userId ? { ...msg, IS_READ: 1 } : msg,
                ),
            );

            // Update unread count
            setUnreadCount(0);

            return { success: true, updatedCount: data.updatedCount };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteMessage = async (id) => {
        try {
            const response = await fetch(`${API_URL}/employeeMessage/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete message");

            // Update local state
            setMessages((prev) => prev.filter((msg) => msg.ID !== id));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <EmployeeMessageContext.Provider
            value={{
                messages,
                unreadCount,
                loading,
                error,
                fetchMessages,
                fetchMessageById,
                fetchUserMessages,
                fetchSentMessages,
                fetchReceivedMessages,
                fetchUnreadCount,
                sendMessage,
                markAsRead,
                markAllAsRead,
                deleteMessage,
            }}
        >
            {children}
        </EmployeeMessageContext.Provider>
    );
};

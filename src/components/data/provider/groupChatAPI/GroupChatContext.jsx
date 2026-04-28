import { useState } from "react";
import { GroupChatContext } from "./groupChatContext";

const API_URL = import.meta.env.VITE_API_URL;

export const GroupChatProvider = ({ children }) => {
    const [groupUnreadCount, setGroupUnreadCount] = useState(0);
    // Create a new group. memberIds should include all members (creator is added server-side too).
    const createGroup = async (name, createdBy, memberIds) => {
        try {
            const response = await fetch(`${API_URL}/groupChat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, createdBy, memberIds }),
            });
            if (!response.ok) throw new Error("Failed to create group");
            const data = await response.json();
            return { success: true, groupId: data.groupId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Fetch all groups a user belongs to (includes MEMBERS array per group)
    const fetchUserGroups = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/groupChat/user/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch groups");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Fetch all messages in a group
    const fetchGroupMessages = async (groupId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/messages`,
            );
            if (!response.ok) throw new Error("Failed to fetch group messages");
            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Send a message to a group
    const sendGroupMessage = async (groupId, senderId, messageContent) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ senderId, messageContent }),
                },
            );
            if (!response.ok) throw new Error("Failed to send group message");
            const data = await response.json();
            return { success: true, messageId: data.messageId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Mark all unread messages in a group as read for a user
    const markGroupAsRead = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/messages/read/${userId}`,
                { method: "PUT" },
            );
            if (!response.ok) throw new Error("Failed to mark group messages as read");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Fetch total unread group messages across all groups for a user
    const fetchGroupUnreadTotal = async (userId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/unread/total/${userId}`,
            );
            if (!response.ok) throw new Error("Failed to fetch group unread total");
            const data = await response.json();
            setGroupUnreadCount(data.totalUnread);
            return { success: true, count: data.totalUnread };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Add a user to a group
    const addGroupMember = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/members`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                },
            );
            if (!response.ok) throw new Error("Failed to add group member");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Remove a user from a group
    const removeGroupMember = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/members/${userId}`,
                { method: "DELETE" },
            );
            if (!response.ok) throw new Error("Failed to remove group member");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Delete a single group message
    const deleteGroupMessage = async (messageId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/messages/${messageId}`,
                { method: "DELETE" },
            );
            if (!response.ok) throw new Error("Failed to delete group message");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Delete a group
    const deleteGroup = async (groupId) => {
        try {
            const response = await fetch(`${API_URL}/groupChat/${groupId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete group");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Get unread count in a group for a user
    const fetchGroupUnreadCount = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${API_URL}/groupChat/${groupId}/unread/${userId}`,
            );
            if (!response.ok) throw new Error("Failed to fetch group unread count");
            const data = await response.json();
            return { success: true, count: data.unreadCount, latestMessage: data.latestMessage ?? null };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return (
        <GroupChatContext.Provider
            value={{
                createGroup,
                fetchUserGroups,
                fetchGroupMessages,
                sendGroupMessage,
                markGroupAsRead,
                fetchGroupUnreadCount,
                deleteGroup,
                deleteGroupMessage,
                addGroupMember,
                removeGroupMember,
                groupUnreadCount,
                fetchGroupUnreadTotal,
            }}
        >
            {children}
        </GroupChatContext.Provider>
    );
};

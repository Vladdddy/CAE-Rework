import { useState, useEffect } from "react";
import { ShiftOrderContext } from "./shiftOrderContext";

const API_URL = import.meta.env.VITE_API_URL;

export const ShiftOrderProvider = ({ children }) => {
    const [shiftOrders, setShiftOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch shift orders on mount
    useEffect(() => {
        fetchShiftOrders();
    }, []);

    const fetchShiftOrders = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/shiftOrder`);

            if (!response.ok) throw new Error("Failed to fetch shift orders");
            const data = await response.json();

            setShiftOrders(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching shift orders:", err);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const addShiftOrder = async (newOrder) => {
        try {
            const response = await fetch(`${API_URL}/shiftOrder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newOrder),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add shift order:", errorData);
                throw new Error("Failed to add shift order");
            }

            const savedOrder = await response.json();
            await fetchShiftOrders(true); // Refresh the list
            return { success: true, data: savedOrder };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateShiftOrder = async (id, updatedOrder) => {
        try {
            const response = await fetch(`${API_URL}/shiftOrder/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedOrder),
            });

            if (!response.ok) throw new Error("Failed to update shift order");

            await fetchShiftOrders(true); // Refresh the list
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const saveShiftOrders = async (orderedUserIds) => {
        try {
            const currentOrders = shiftOrders;
            const toUpdate = [];
            const toCreate = [];

            for (let i = 0; i < orderedUserIds.length; i++) {
                const userId = orderedUserIds[i];
                const position = i + 1;
                const existing = currentOrders.find(
                    (o) => o.POSITIONED_USER_ID === userId,
                );
                if (existing) {
                    toUpdate.push({
                        ID: existing.ID,
                        POSITION: position,
                        POSITIONED_USER_ID: userId,
                    });
                } else {
                    toCreate.push({ POSITION: position, POSITIONED_USER_ID: userId });
                }
            }

            // Batch-update existing orders in one request (no UNIQUE constraint on backup table)
            if (toUpdate.length > 0) {
                const response = await fetch(
                    `${API_URL}/shiftOrder/batch/reorder`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orders: toUpdate }),
                    },
                );
                if (!response.ok)
                    throw new Error("Failed to batch update shift orders");
            }

            // Create any brand-new entries
            for (const newOrder of toCreate) {
                await addShiftOrder(newOrder);
            }

            await fetchShiftOrders(true);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error("Error saving shift orders:", err);
            return { success: false, error: err.message };
        }
    };

    return (
        <ShiftOrderContext.Provider
            value={{
                shiftOrders,
                loading,
                error,
                fetchShiftOrders,
                addShiftOrder,
                updateShiftOrder,
                saveShiftOrders,
            }}
        >
            {children}
        </ShiftOrderContext.Provider>
    );
};

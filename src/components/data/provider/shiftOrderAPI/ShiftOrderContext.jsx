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
            // Fetch current orders to check what exists
            const currentOrders = shiftOrders;

            // Phase 1: Set all existing positions to temporary high values in parallel
            // This prevents unique constraint violations during reordering
            const tempOffset = 10000;
            const tempUpdates = currentOrders.map((order) => {
                const tempPosition = order.POSITION + tempOffset;
                return updateShiftOrder(order.ID, {
                    POSITION: tempPosition,
                    POSITIONED_USER_ID: order.POSITIONED_USER_ID,
                });
            });

            await Promise.all(tempUpdates);

            // Phase 2: Update or create orders with actual positions in parallel
            const finalUpdates = orderedUserIds.map(async (userId, index) => {
                const position = index + 1;
                const existingOrder = currentOrders.find(
                    (order) => order.POSITIONED_USER_ID === userId,
                );

                if (existingOrder) {
                    // Update existing order to actual position
                    return updateShiftOrder(existingOrder.ID, {
                        POSITION: position,
                        POSITIONED_USER_ID: userId,
                    });
                } else {
                    // Create new order
                    return addShiftOrder({
                        POSITION: position,
                        POSITIONED_USER_ID: userId,
                    });
                }
            });

            await Promise.all(finalUpdates);

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

import { useCallback, useEffect, useState } from "react";
import { TaskSimOneContext } from "./taskSimOneContext";

const API_URL = import.meta.env.VITE_API_URL;

export const TaskSimOneProvider = ({ children }) => {
    const [taskSimOne, setTaskSimOne] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonthTasks, setCurrentMonthTasks] = useState([]);
    const [currentMonthLoading, setCurrentMonthLoading] = useState(false);

    useEffect(() => {
        fetchTaskSimOne();

        const interval = setInterval(() => {
            fetchTaskSimOne(true);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log("taskSimOne updated:", taskSimOne);
    }, [taskSimOne]);

    const fetchTaskSimOne = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/taskSimOne`);
            if (!response.ok) {
                throw new Error("Failed to fetch taskSimOne data");
            }

            const data = await response.json();
            setTaskSimOne(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const fetchCurrentMonthTasks = useCallback(async () => {
        try {
            setCurrentMonthLoading(true);
            const response = await fetch(`${API_URL}/taskSimOne/current-month`);
            if (!response.ok) {
                throw new Error("Failed to fetch current month PM tasks");
            }
            const data = await response.json();
            setCurrentMonthTasks(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setCurrentMonthLoading(false);
        }
    }, []);

    const updateTaskSimOne = async (id, assignedTo) => {
        try {
            const response = await fetch(`${API_URL}/taskSimOne/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assignedTo }),
            });

            if (!response.ok) {
                throw new Error("Failed to update taskSimOne task");
            }

            await fetchTaskSimOne(true);
            setError(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <TaskSimOneContext.Provider
            value={{
                taskSimOne,
                loading,
                error,
                fetchTaskSimOne,
                updateTaskSimOne,
                currentMonthTasks,
                currentMonthLoading,
                fetchCurrentMonthTasks,
            }}
        >
            {children}
        </TaskSimOneContext.Provider>
    );
};

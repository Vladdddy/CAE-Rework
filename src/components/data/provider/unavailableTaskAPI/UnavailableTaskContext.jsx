import { useState, useEffect } from "react";
import { UnavailableTaskContext } from "./unavailableTaskContext";

const API_URL = import.meta.env.VITE_API_URL;

export const UnavailableTaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch unavailable tasks on mount and every 1 minute
    useEffect(() => {
        fetchTasks();

        const interval = setInterval(() => {
            fetchTasks(true); // Silent refresh
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/unavailableTask`);

            if (!response.ok)
                throw new Error("Failed to fetch unavailable tasks");
            const data = await response.json();

            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const addTask = async (newTask) => {
        try {
            const existingIds = (tasks || [])
                .map((task) => Number(task?.ID ?? task?.id))
                .filter((id) => Number.isFinite(id));

            const generatedId =
                existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

            const taskWithId = {
                ...newTask,
                id: newTask?.id ?? newTask?.ID ?? generatedId,
            };

            const response = await fetch(`${API_URL}/unavailableTask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: taskWithId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(async () => ({
                    details: await response.text().catch(() => ""),
                }));
                console.error("Failed to add unavailable task:", errorData);
                throw new Error(
                    errorData?.details || "Failed to add unavailable task",
                );
            }

            const savedTask = await response.json();

            const savedId = savedTask?.id ?? taskWithId.id;

            setTasks((prev) => [
                ...prev,
                {
                    ...taskWithId,
                    id: savedId,
                    ID: savedId,
                },
            ]);

            return { success: true, data: savedTask };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateTask = async (id, updatedTask) => {
        console.log(
            "Updating unavailable task with ID:",
            id,
            "with data:",
            updatedTask,
        );
        try {
            const response = await fetch(`${API_URL}/unavailableTask/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: updatedTask, id: id }),
            });

            if (!response.ok)
                throw new Error("Failed to update unavailable task");
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === id ? { ...updatedTask, id } : task,
                ),
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/unavailableTask/${id}`, {
                method: "DELETE",
            });

            if (!response.ok)
                throw new Error("Failed to delete unavailable task");
            setTasks((prev) => prev.filter((task) => task.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <UnavailableTaskContext.Provider
            value={{
                tasks,
                loading,
                error,
                fetchTasks,
                addTask,
                updateTask,
                deleteTask,
            }}
        >
            {children}
        </UnavailableTaskContext.Provider>
    );
};

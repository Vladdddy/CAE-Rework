import { useState, useEffect } from "react";
import { TaskContext } from "./taskContext";

const API_URL = import.meta.env.VITE_API_URL;

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tasks once on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/tasks`);

            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();

            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (newTask) => {
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: newTask }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add task:", errorData);
                throw new Error("Failed to add task");
            }
            const savedTask = await response.json();
            newTask.id = savedTask.id;
            setTasks((prev) => [...prev, newTask]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateTask = async (id, updatedTask) => {
        console.log("Updating task with ID:", id, "with data:", updatedTask);
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: updatedTask, id: id }),
            });

            if (!response.ok) throw new Error("Failed to update task");
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === id ? { ...updatedTask, id } : task
                )
            );
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete task");
            setTasks((prev) => prev.filter((task) => task.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return (
        <TaskContext.Provider
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
        </TaskContext.Provider>
    );
};

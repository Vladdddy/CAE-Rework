import { useState, useEffect } from "react";
import { TaskContext } from "./provider/taskContext";

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
            const response = await fetch("YOUR_API_ENDPOINT/tasks");
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
        // API call then update state
        setTasks((prev) => [...prev, newTask]);
    };

    const updateTask = async (id, updatedTask) => {
        // API call then update state
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? updatedTask : task))
        );
    };

    const deleteTask = async (id) => {
        // API call then update state
        setTasks((prev) => prev.filter((task) => task.id !== id));
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

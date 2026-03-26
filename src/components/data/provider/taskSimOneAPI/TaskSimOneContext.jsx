import { useEffect, useState } from "react";
import { TaskSimOneContext } from "./taskSimOneContext";

const API_URL = import.meta.env.VITE_API_URL;

export const TaskSimOneProvider = ({ children }) => {
    const [taskSimOne, setTaskSimOne] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <TaskSimOneContext.Provider
            value={{
                taskSimOne,
                loading,
                error,
                fetchTaskSimOne,
            }}
        >
            {children}
        </TaskSimOneContext.Provider>
    );
};

import { useEffect, useState } from "react";
import { TrainingLoadContext } from "./trainingLoadContext";

const API_URL = import.meta.env.VITE_API_URL;

export const TrainingLoadProvider = ({ children }) => {
    const [trainingLoads, setTrainingLoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrainingLoads();
    }, []);

    const fetchTrainingLoads = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/trainingLoad`);
            if (!response.ok) {
                throw new Error("Failed to fetch training load data");
            }

            const data = await response.json();
            setTrainingLoads(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TrainingLoadContext.Provider
            value={{
                trainingLoads,
                loading,
                error,
                fetchTrainingLoads,
            }}
        >
            {children}
        </TrainingLoadContext.Provider>
    );
};

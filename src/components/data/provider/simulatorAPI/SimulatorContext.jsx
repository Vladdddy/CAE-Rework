import { useState } from "react";
import { SimulatorContext } from "./simulatorContext";

const API_URL = import.meta.env.VITE_API_URL;

export const SimulatorProvider = ({ children }) => {
    const [simulators, setSimulators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSimulators = async () => {
        console.log("Fetching simulators");
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/simulators`);
            if (!response.ok) throw new Error("Failed to fetch simulators");
            const data = await response.json();

            setSimulators(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createSimulator = async (newSimulator) => {
        console.log(
            "Creating simulator for simulator Name:",
            newSimulator.name,
        );

        try {
            const response = await fetch(`${API_URL}/simulators`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ simulator: newSimulator }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || "Failed to create simulator",
                    status: response.status,
                };
            }

            await fetchSimulators();

            return { success: true, data, status: response.status };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message, status: null };
        }
    };

    return (
        <SimulatorContext.Provider
            value={{
                simulators,
                loading,
                error,
                fetchSimulators,
                createSimulator,
            }}
        >
            {children}
        </SimulatorContext.Provider>
    );
};

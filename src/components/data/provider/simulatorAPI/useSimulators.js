import { useContext } from "react";
import { SimulatorContext } from "./simulatorContext";

export const useSimulators = () => {
    const context = useContext(SimulatorContext);
    if (!context) {
        throw new Error(
            "useSimulators must be used within a SimulatorProvider",
        );
    }
    return context;
};

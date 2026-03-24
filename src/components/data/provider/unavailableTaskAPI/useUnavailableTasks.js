import { useContext } from "react";
import { UnavailableTaskContext } from "./unavailableTaskContext";

export const useUnavailableTasks = () => {
    const context = useContext(UnavailableTaskContext);
    if (!context) {
        throw new Error(
            "useUnavailableTasks must be used within an UnavailableTaskProvider",
        );
    }
    return context;
};

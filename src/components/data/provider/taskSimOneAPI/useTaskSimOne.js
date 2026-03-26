import { useContext } from "react";
import { TaskSimOneContext } from "./taskSimOneContext";

export const useTaskSimOne = () => {
    const context = useContext(TaskSimOneContext);
    if (!context) {
        throw new Error(
            "useTaskSimOne must be used within a TaskSimOneProvider",
        );
    }
    return context;
};

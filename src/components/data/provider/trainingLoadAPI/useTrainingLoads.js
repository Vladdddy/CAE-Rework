import { useContext } from "react";
import { TrainingLoadContext } from "./trainingLoadContext";

export const useTrainingLoads = () => {
    const context = useContext(TrainingLoadContext);
    if (!context) {
        throw new Error(
            "useTrainingLoads must be used within a TrainingLoadProvider",
        );
    }
    return context;
};

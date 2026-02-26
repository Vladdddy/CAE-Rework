import { useContext } from "react";
import { PatternShiftContext } from "./patternShiftContext";

export const usePatternShifts = () => {
    const context = useContext(PatternShiftContext);
    if (!context) {
        throw new Error(
            "usePatternShifts must be used within a PatternShiftProvider",
        );
    }
    return context;
};

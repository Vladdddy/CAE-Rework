import { useContext } from "react";
import { UnavailableLogbookContext } from "./unavailableLogbookContext";

export const useUnavailableLogbooks = () => {
    const context = useContext(UnavailableLogbookContext);
    if (!context) {
        throw new Error(
            "useUnavailableLogbooks must be used within an UnavailableLogbookProvider",
        );
    }
    return context;
};

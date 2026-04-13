import { useContext } from "react";
import { PMTechCommentsContext } from "./pmTechCommentsContext";

export const usePMTechComments = () => {
    const context = useContext(PMTechCommentsContext);
    if (!context) {
        throw new Error(
            "usePMTechComments must be used within a PMTechCommentsProvider",
        );
    }
    return context;
};

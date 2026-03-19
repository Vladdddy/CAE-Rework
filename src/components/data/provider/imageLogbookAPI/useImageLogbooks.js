import { useContext } from "react";
import { ImageLogbookContext } from "./imageLogbookContext";

export const useImageLogbooks = () => {
    const context = useContext(ImageLogbookContext);

    if (!context) {
        throw new Error(
            "useImageLogbooks must be used within an ImageLogbookProvider",
        );
    }

    return context;
};

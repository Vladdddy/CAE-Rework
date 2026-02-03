import { useContext } from "react";
import { LogbookContext } from "./logbookContext";

export const useLogbooks = () => {
    const context = useContext(LogbookContext);
    if (!context) {
        throw new Error("useLogbooks must be used within a LogbookProvider");
    }
    return context;
};

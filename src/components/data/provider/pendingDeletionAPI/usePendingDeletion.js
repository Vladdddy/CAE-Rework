import { useContext } from "react";
import { PendingDeletionContext } from "./pendingDeletionContext";

export const usePendingDeletion = () => {
    const context = useContext(PendingDeletionContext);
    if (!context) {
        throw new Error("usePendingDeletion must be used within a PendingDeletionProvider");
    }
    return context;
};

import { useContext } from "react";
import { GroupChatContext } from "./groupChatContext";

export const useGroupChat = () => {
    const context = useContext(GroupChatContext);
    if (!context) {
        throw new Error("useGroupChat must be used within a GroupChatProvider");
    }
    return context;
};

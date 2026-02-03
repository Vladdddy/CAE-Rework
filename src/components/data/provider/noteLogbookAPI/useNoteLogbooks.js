import { useContext } from "react";
import { NoteLogbookContext } from "./noteLogbookContext";

export const useNoteLogbooks = () => {
    const context = useContext(NoteLogbookContext);
    if (!context) {
        throw new Error(
            "useNoteLogbooks must be used within a NoteLogbookProvider",
        );
    }
    return context;
};

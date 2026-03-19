import { useContext } from "react";
import { ImageTaskContext } from "./imageTaskContext";

export const useImageTasks = () => {
    const context = useContext(ImageTaskContext);

    if (!context) {
        throw new Error(
            "useImageTasks must be used within an ImageTaskProvider",
        );
    }

    return context;
};

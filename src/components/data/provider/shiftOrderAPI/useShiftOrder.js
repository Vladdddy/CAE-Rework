import { useContext } from "react";
import { ShiftOrderContext } from "./shiftOrderContext";

export const useShiftOrder = () => {
    const context = useContext(ShiftOrderContext);
    if (!context) {
        throw new Error(
            "useShiftOrder must be used within a ShiftOrderProvider",
        );
    }
    return context;
};

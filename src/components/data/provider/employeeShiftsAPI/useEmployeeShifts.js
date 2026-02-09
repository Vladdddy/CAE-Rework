import { useContext } from "react";
import { EmployeeShiftsContext } from "./employeeShiftsContext";

export const useEmployeeShifts = () => {
    const context = useContext(EmployeeShiftsContext);
    if (!context) {
        throw new Error(
            "useEmployeeShifts must be used within a EmployeeShiftsProvider",
        );
    }
    return context;
};

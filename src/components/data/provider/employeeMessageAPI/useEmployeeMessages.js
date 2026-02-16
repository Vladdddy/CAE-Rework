import { useContext } from "react";
import { EmployeeMessageContext } from "./employeeMessageContext";

export const useEmployeeMessages = () => {
    const context = useContext(EmployeeMessageContext);
    if (!context) {
        throw new Error(
            "useEmployeeMessages must be used within an EmployeeMessageProvider",
        );
    }
    return context;
};

import { useContext } from "react";
import { EmployeeOverviewContext } from "./employeeOverviewContext";

export const useEmployeeOverviews = () => {
    const context = useContext(EmployeeOverviewContext);
    if (!context) {
        throw new Error(
            "useEmployeeOverviews must be used within a EmployeeOverviewProvider",
        );
    }
    return context;
};

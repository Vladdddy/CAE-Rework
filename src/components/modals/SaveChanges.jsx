import React, { useState } from "react";
import DoneIcon from "../../assets/icons/done";
import WarningIcon from "../../assets/icons/warning";
import Close from "../../assets/icons/close";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI_variant/useEmployeeShifts";

function SaveChanges({ onClose, postChanges, putChanges }) {
    const { addEmployeeShift, updateEmployeeShift, deleteEmployeeShift } =
        useEmployeeShifts();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);

        try {
            // Batch all POST requests into single API call
            if (Object.keys(postChanges).length > 0) {
                const shiftsToAdd = Object.values(postChanges).map(
                    (change) => ({
                        EMPLOYEE_ID: change.EMPLOYEE_ID,
                        SELECTED_DATE: change.SELECTED_DATE,
                        SHIFT_TYPE: change.SHIFT_TYPE,
                    }),
                );
                await addEmployeeShift(shiftsToAdd);
            }

            // Process PUT requests (update existing shifts or delete if null)
            const putPromises = Object.values(putChanges).map(
                async (change) => {
                    // If SHIFT_TYPE is null, delete the shift
                    if (change.SHIFT_TYPE === null) {
                        return await deleteEmployeeShift(
                            change.ID || change.id,
                        );
                    }
                    // Otherwise, update the shift
                    return await updateEmployeeShift(change.ID || change.id, {
                        EMPLOYEE_ID: change.EMPLOYEE_ID,
                        SELECTED_DATE: change.SELECTED_DATE,
                        SHIFT_TYPE: change.SHIFT_TYPE,
                    });
                },
            );

            // Wait for all PUT/DELETE calls to complete
            if (putPromises.length > 0) {
                await Promise.all(putPromises);
            }

            // Clear the changes from localStorage
            if (window.clearShiftChanges) {
                window.clearShiftChanges();
            }

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error saving changes:", error);
            // Optionally show an error message to the user
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        // Clear the changes from localStorage without saving
        if (window.clearShiftChanges) {
            window.clearShiftChanges();
        }
        // Close the modal
        onClose();
    };

    return (
        <div
            className="fixed top-0 left-0 right-0 cursor-default flex items-center justify-center z-50 mx-4 my-4"
            onClick={isProcessing ? null : onClose}
        >
            <div
                className="bg-[var(--light-primary)] rounded-xl p-4 max-w-lg w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center gap-16">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <WarningIcon className="w-6" />
                        <h1 className="text-md">
                            Applicare le modifiche svolte?
                        </h1>
                    </div>

                    <div className="flex items-center gap-1">
                        <div
                            onClick={isProcessing ? null : handleConfirm}
                            className={`flex justify-center items-center gap-1 cursor-pointer p-2 px-4 text-[var(--green)] bg-[#32de841a] hover:bg-[#32de842a] transition duration-300 rounded-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <DoneIcon className="w-6" />
                            Si
                        </div>
                        <div
                            onClick={isProcessing ? null : handleCancel}
                            className={`flex justify-center items-center gap-1 cursor-pointer p-2 px-4 text-[var(--red)] bg-[#ff4d4d1a] hover:bg-[#ff4d4d2a] transition duration-300 rounded-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Close className="w-6" />
                            No
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SaveChanges;

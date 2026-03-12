import React, { useState } from "react";
import DoneIcon from "../../assets/icons/done";
import WarningIcon from "../../assets/icons/warning";
import Close from "../../assets/icons/close";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI_variant/useEmployeeShifts";

function SaveChanges({ onClose, postChanges, putChanges }) {
    const {
        addEmployeeShift,
        updateMultipleShifts,
        deleteEmployeeShift,
        employeeShifts,
    } = useEmployeeShifts();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setIsProcessing(true);
        setError(null);

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
                const result = await addEmployeeShift(shiftsToAdd);

                // Check if the API call was successful
                if (result && !result.success && result.error) {
                    throw new Error(result.error);
                }
            }

            // Process PUT requests - Group by monthly record ID to avoid race conditions
            if (Object.keys(putChanges).length > 0) {
                // Group changes by monthly record ID
                const changesByMonthlyRecord = {};
                const deletions = [];

                Object.values(putChanges).forEach((change) => {
                    // If SHIFT_TYPE is null, it's a DELETE operation
                    if (change.SHIFT_TYPE === null) {
                        deletions.push(change);
                        return;
                    }

                    // Find the shift to get the MONTHLY_RECORD_ID
                    const shift = employeeShifts.find(
                        (s) => s.ID === (change.ID || change.id),
                    );

                    if (!shift) {
                        console.warn(
                            `Shift not found for ID: ${change.ID || change.id}`,
                        );
                        return;
                    }

                    const monthlyRecordId = shift.MONTHLY_RECORD_ID;

                    if (!changesByMonthlyRecord[monthlyRecordId]) {
                        changesByMonthlyRecord[monthlyRecordId] = [];
                    }

                    // Extract day from the date
                    const day = new Date(change.SELECTED_DATE).getDate();

                    changesByMonthlyRecord[monthlyRecordId].push({
                        day: day,
                        shiftType: change.SHIFT_TYPE,
                    });
                });

                // Update each monthly record with its batch of updates
                const updatePromises = Object.entries(
                    changesByMonthlyRecord,
                ).map(([monthlyRecordId, updates]) =>
                    updateMultipleShifts(monthlyRecordId, updates),
                );

                // Process deletions
                const deletePromises = deletions.map((change) =>
                    deleteEmployeeShift(change.ID || change.id),
                );

                // Wait for all operations to complete
                const allPromises = [...updatePromises, ...deletePromises];
                if (allPromises.length > 0) {
                    const results = await Promise.all(allPromises);

                    // Check if any operations failed
                    const failedResults = results.filter(
                        (r) => r && !r.success,
                    );
                    if (failedResults.length > 0) {
                        throw new Error(
                            failedResults[0].error ||
                                "Errore durante l'aggiornamento dei turni",
                        );
                    }
                }
            }

            // Clear the changes from localStorage
            if (window.clearShiftChanges) {
                window.clearShiftChanges();
            }

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error saving changes:", error);
            setError(
                error.message ||
                    "Errore durante il salvataggio delle modifiche",
            );
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
                <div className="flex flex-col gap-4">
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

                    {error && (
                        <div className="bg-[var(--red)] bg-opacity-10 border border-[var(--red)] rounded-md p-3">
                            <p className="text-[var(--red)] text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SaveChanges;

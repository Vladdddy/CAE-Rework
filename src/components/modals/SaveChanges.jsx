import React from "react";
import DoneIcon from "../../assets/icons/done";
import WarningIcon from "../../assets/icons/warning";
import Close from "../../assets/icons/close";

function SaveChanges({ onClose }) {
    return (
        <div
            className="fixed top-0 left-0 right-0 cursor-default flex items-center justify-center z-50 mx-4 my-4"
            onClick={onClose}
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
                            onClick={onClose}
                            className="flex justify-center items-center gap-1 cursor-pointer p-2 px-4 text-[var(--green)] bg-[#32de841a] hover:bg-[#32de842a] transition duration-300 rounded-md"
                        >
                            <DoneIcon className="w-6" />
                            Si
                        </div>
                        <div
                            onClick={onClose}
                            className="flex justify-center items-center gap-1 cursor-pointer p-2 px-4 text-[var(--red)] bg-[#ff4d4d1a] hover:bg-[#ff4d4d2a] transition duration-300 rounded-md"
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

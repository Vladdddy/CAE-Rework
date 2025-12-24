import React from "react";
import UserIcon from "../../assets/icons/user.tsx";

function Employee(props) {
    const role = props.role || "Employee";

    return (
        <div
            className={`flex flex-row items-center justify-between gap-2 p-2 border rounded-md 
                ${
                    role === "Shift Leader"
                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                        : "border-[var(--light-primary)] bg-[var(--white)] text-[var(--black)]"
                }`}
        >
            <div className="flex flex-row items-center justify-start gap-2">
                <UserIcon className="w-6" />
                <h1 className="text-l">Gianluca</h1>
            </div>
            <p className="text-sm">OP</p>
        </div>
    );
}

export default Employee;

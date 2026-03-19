import React from "react";
import UserIcon from "../../assets/icons/user.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";

function Employee(props) {
    const name = props.name;
    //const shortName = props.shortName || "??";
    const colorClass = props.shiftType
        ? GetColorForShift(props.shiftType)
        : props.time === "Diurno"
          ? "bg-green-800 text-white"
          : props.time === "Notturno"
            ? "bg-blue-800 text-white"
            : "bg-gray-200 text-black";

    return (
        <div
            className={` ${colorClass} flex flex-row items-center justify-between gap-2 p-2 rounded-md 
                `}
        >
            <div className="flex flex-row items-center justify-start gap-2 w-full">
                <UserIcon className="w-6 shrink-0 text-white" />
                <h1 className="text-l truncate font-medium text-white">
                    {name.split(".")[0].charAt(0).toUpperCase() +
                        name.split(".")[0].slice(1)}
                    {name.split(".")[1] && (
                        <>
                            {" "}
                            {name.split(".")[1].charAt(0).toUpperCase() +
                                name.split(".")[1].slice(1)}
                        </>
                    )}
                </h1>
            </div>
            {/*<p className="text-sm">{shortName}</p>*/}
        </div>
    );
}

export default Employee;

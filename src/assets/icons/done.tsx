import React from "react";

const DoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={"none"}
        {...props}
    >
        <path
            d="M5 14L8.5 17.5L19 6.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        ></path>
    </svg>
);

export default DoneIcon;

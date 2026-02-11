import React from "react";

const LongArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={"none"}
        {...props}
    >
        <path
            d="M18.5 12L4.99997 12"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        ></path>
        <path
            d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        ></path>
    </svg>
);

export default LongArrowIcon;
